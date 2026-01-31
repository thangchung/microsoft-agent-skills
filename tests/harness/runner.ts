#!/usr/bin/env node
/**
 * Skill Evaluation Runner
 *
 * Main entry point for running skill evaluations. Coordinates loading scenarios,
 * generating code via Copilot, and evaluating against acceptance criteria.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Command } from "commander";
import { parse as parseYaml } from "yaml";
import chalk from "chalk";

import type {
  TestScenario,
  SkillTestSuite,
  EvaluationSummary,
  EvaluationResult,
  GenerationConfig,
  Finding,
} from "./types.js";
import { DEFAULT_GENERATION_CONFIG, Severity, createFinding } from "./types.js";
import { SkillCopilotClient, checkCopilotAvailable } from "./copilot-client.js";
import { AcceptanceCriteriaLoader } from "./criteria-loader.js";
import { CodeEvaluator } from "./evaluator.js";

// =============================================================================
// Runner Class
// =============================================================================

/**
 * Runs skill evaluations end-to-end.
 *
 * Workflow:
 * 1. Load test scenarios from tests/scenarios/<skill>/
 * 2. Load acceptance criteria from .github/skills/<skill>/
 * 3. Generate code for each scenario using Copilot SDK
 * 4. Evaluate generated code against criteria
 * 5. Report results
 */
export class SkillEvaluationRunner {
  private static readonly SCENARIOS_DIR = "scenarios";

  private basePath: string;
  private scenariosDir: string;
  private useMock: boolean;
  private verbose: boolean;

  private criteriaLoader: AcceptanceCriteriaLoader;
  private copilotClient: SkillCopilotClient;

  constructor(options: {
    basePath?: string;
    useMock?: boolean;
    verbose?: boolean;
  } = {}) {
    this.basePath = options.basePath ?? this.findRepoRoot();
    // Scenarios are in tests/scenarios relative to repo root
    this.scenariosDir = join(
      this.basePath,
      "tests",
      SkillEvaluationRunner.SCENARIOS_DIR
    );
    this.useMock = options.useMock ?? true;
    this.verbose = options.verbose ?? false;

    this.criteriaLoader = new AcceptanceCriteriaLoader(this.basePath);
    this.copilotClient = new SkillCopilotClient(this.basePath, this.useMock);
  }

  /**
   * Find the repository root by looking for .github/skills directory.
   */
  private findRepoRoot(): string {
    const cwd = process.cwd();

    // Check if we're in the tests directory
    const parentSkills = join(cwd, "..", ".github", "skills");
    if (existsSync(parentSkills)) {
      return resolve(cwd, "..");
    }

    // Check if we're at the repo root
    const rootSkills = join(cwd, ".github", "skills");
    if (existsSync(rootSkills)) {
      return cwd;
    }

    // Fallback to cwd
    return cwd;
  }

  /**
   * List skills that have both criteria and scenarios.
   */
  listAvailableSkills(): string[] {
    const skillsWithCriteria = new Set(
      this.criteriaLoader.listSkillsWithCriteria()
    );
    const skillsWithScenarios = new Set<string>();

    if (existsSync(this.scenariosDir)) {
      for (const entry of readdirSync(this.scenariosDir, {
        withFileTypes: true,
      })) {
        if (entry.isDirectory()) {
          const scenariosFile = join(
            this.scenariosDir,
            entry.name,
            "scenarios.yaml"
          );
          if (existsSync(scenariosFile)) {
            skillsWithScenarios.add(entry.name);
          }
        }
      }
    }

    // Intersection of both sets
    const available = [...skillsWithCriteria].filter((s) =>
      skillsWithScenarios.has(s)
    );
    return available.sort();
  }

  /**
   * List all skills with acceptance criteria (even without scenarios).
   */
  listSkillsWithCriteria(): string[] {
    return this.criteriaLoader.listSkillsWithCriteria();
  }

  /**
   * Load test scenarios for a skill.
   */
  loadScenarios(skillName: string): SkillTestSuite {
    const scenariosFile = join(this.scenariosDir, skillName, "scenarios.yaml");

    if (!existsSync(scenariosFile)) {
      // Return default scenarios if no file exists
      return this.defaultScenarios(skillName);
    }

    const content = readFileSync(scenariosFile, "utf-8");
    const data = parseYaml(content) as {
      config?: {
        model?: string;
        max_tokens?: number;
        temperature?: number;
      };
      scenarios?: Array<{
        name?: string;
        prompt?: string;
        expected_patterns?: string[];
        forbidden_patterns?: string[];
        tags?: string[];
        mock_response?: string;
      }>;
    };

    const scenarios: TestScenario[] = (data.scenarios ?? []).map((sc) => ({
      name: sc.name ?? "unnamed",
      prompt: sc.prompt ?? "",
      expectedPatterns: sc.expected_patterns ?? [],
      forbiddenPatterns: sc.forbidden_patterns ?? [],
      tags: sc.tags ?? [],
      mockResponse: sc.mock_response,
    }));

    const configData = data.config ?? {};
    const config: GenerationConfig = {
      model: configData.model ?? DEFAULT_GENERATION_CONFIG.model,
      maxTokens: configData.max_tokens ?? DEFAULT_GENERATION_CONFIG.maxTokens,
      temperature:
        configData.temperature ?? DEFAULT_GENERATION_CONFIG.temperature,
      includeSkillContext: DEFAULT_GENERATION_CONFIG.includeSkillContext,
    };

    return {
      skillName,
      scenarios,
      config,
    };
  }

  /**
   * Generate default test scenarios based on skill name.
   */
  private defaultScenarios(skillName: string): SkillTestSuite {
    const scenarios: TestScenario[] = [
      {
        name: "basic_usage",
        prompt: `Write a basic example using the ${skillName} SDK`,
        expectedPatterns: [],
        forbiddenPatterns: [],
        tags: ["basic"],
      },
      {
        name: "authentication",
        prompt: `Show how to authenticate with ${skillName}`,
        expectedPatterns: [],
        forbiddenPatterns: [],
        tags: ["auth"],
      },
    ];

    return {
      skillName,
      scenarios,
      config: DEFAULT_GENERATION_CONFIG,
    };
  }

  /**
   * Run evaluation for a skill.
   */
  async run(
    skillName: string,
    scenarioFilter?: string
  ): Promise<EvaluationSummary> {
    const startTime = Date.now();

    // Load criteria and scenarios
    const criteria = this.criteriaLoader.load(skillName);
    const suite = this.loadScenarios(skillName);

    // Filter scenarios if requested
    let scenarios = suite.scenarios;
    if (scenarioFilter) {
      const filterLower = scenarioFilter.toLowerCase();
      scenarios = scenarios.filter(
        (s) =>
          s.name.toLowerCase().includes(filterLower) ||
          s.tags.some((t) => t.toLowerCase().includes(filterLower))
      );
    }

    // Create evaluator
    const evaluator = new CodeEvaluator(criteria);

    // Run each scenario
    const results: EvaluationResult[] = [];

    for (const scenario of scenarios) {
      if (this.verbose) {
        console.log(`  Running scenario: ${scenario.name}`);
      }

      // Setup mock response if provided
      if (scenario.mockResponse && this.useMock) {
        this.copilotClient.addMockResponse(scenario.name, scenario.mockResponse);
      }

      // Generate code
      const genResult = await this.copilotClient.generate(
        scenario.prompt,
        skillName,
        suite.config,
        scenario.name
      );

      // Evaluate
      const evalResult = evaluator.evaluate(genResult.code, scenario.name);

      // Add scenario-specific checks
      this.checkScenarioPatterns(evalResult, scenario, genResult.code);

      results.push(evalResult);

      if (this.verbose) {
        const status = evalResult.passed ? chalk.green("✓") : chalk.red("✗");
        console.log(`    ${status} Score: ${evalResult.score.toFixed(1)}`);
      }
    }

    const durationMs = Date.now() - startTime;

    // Calculate summary
    const passed = results.filter((r) => r.passed).length;
    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

    return {
      skillName,
      totalScenarios: results.length,
      passed,
      failed: results.length - passed,
      avgScore,
      durationMs,
      results,
    };
  }

  /**
   * Check scenario-specific expected/forbidden patterns.
   */
  private checkScenarioPatterns(
    result: EvaluationResult,
    scenario: TestScenario,
    code: string
  ): void {
    // Check expected patterns
    for (const pattern of scenario.expectedPatterns) {
      if (!code.includes(pattern)) {
        result.findings.push(
          createFinding({
            severity: Severity.WARNING,
            rule: `scenario:${scenario.name}`,
            message: `Expected pattern not found: ${pattern}`,
          })
        );
        result.warningCount++;
      }
    }

    // Check forbidden patterns
    for (const pattern of scenario.forbiddenPatterns) {
      if (code.includes(pattern)) {
        result.findings.push(
          createFinding({
            severity: Severity.ERROR,
            rule: `scenario:${scenario.name}`,
            message: `Forbidden pattern found: ${pattern}`,
          })
        );
        result.errorCount++;
        result.passed = false;
      }
    }

    // Recalculate score after scenario pattern checks
    result.score = this.calculateScore(result);
  }

  /**
   * Calculate score for an evaluation result.
   */
  private calculateScore(result: EvaluationResult): number {
    let score = 100;
    score -= result.errorCount * 20;
    score -= result.warningCount * 5;
    score -= result.matchedIncorrect.length * 15;
    score += result.matchedCorrect.length * 5;
    return Math.max(0, Math.min(100, score));
  }
}

// =============================================================================
// Summary Serialization
// =============================================================================

/**
 * Convert evaluation summary to a plain object for JSON serialization.
 */
function summaryToDict(summary: EvaluationSummary): Record<string, unknown> {
  return {
    skill_name: summary.skillName,
    total_scenarios: summary.totalScenarios,
    passed: summary.passed,
    failed: summary.failed,
    pass_rate:
      summary.totalScenarios > 0 ? summary.passed / summary.totalScenarios : 0,
    avg_score: summary.avgScore,
    duration_ms: summary.durationMs,
    results: summary.results.map((r) => ({
      skill_name: r.skillName,
      scenario: r.scenario,
      passed: r.passed,
      score: r.score,
      error_count: r.errorCount,
      warning_count: r.warningCount,
      matched_correct: r.matchedCorrect,
      matched_incorrect: r.matchedIncorrect,
      findings: r.findings.map((f) => ({
        severity: f.severity,
        rule: f.rule,
        message: f.message,
        line: f.line,
        suggestion: f.suggestion,
      })),
    })),
  };
}

// =============================================================================
// CLI
// =============================================================================

interface CLIOptions {
  list?: boolean;
  filter?: string;
  mock?: boolean;
  verbose?: boolean;
  output?: string;
  outputFile?: string;
}

async function main(): Promise<number> {
  const program = new Command();

  program
    .name("harness")
    .description("Run skill evaluations against acceptance criteria")
    .argument("[skill]", "Skill name to evaluate (e.g., azure-ai-agents-py)")
    .option("--list", "List available skills with test scenarios")
    .option("--filter <pattern>", "Filter scenarios by name or tag")
    .option("--mock", "Use mock responses instead of Copilot SDK")
    .option("-v, --verbose", "Verbose output")
    .option("--output <format>", "Output format (text/json)", "text")
    .option("--output-file <file>", "Write results to file");

  program.parse();

  const options = program.opts<CLIOptions>();
  const skillArg = program.args[0];

  // Check Copilot availability
  const copilotAvailable = checkCopilotAvailable();
  const useMock = options.mock || !copilotAvailable;

  if (!copilotAvailable && !options.mock) {
    console.log(chalk.yellow("⚠️  Copilot SDK not available, using mock mode"));
    console.log("   Install: npm install @github/copilot-sdk");
    console.log();
  }

  const runner = new SkillEvaluationRunner({
    useMock,
    verbose: options.verbose ?? false,
  });

  if (options.list) {
    const skills = runner.listAvailableSkills();
    if (skills.length === 0) {
      console.log(
        "No skills with both acceptance criteria and test scenarios found."
      );
      console.log("\nSkills with criteria only:");
      for (const skill of runner.listSkillsWithCriteria()) {
        console.log(`  - ${skill}`);
      }
    } else {
      console.log(`Available skills (${skills.length}):`);
      for (const skill of skills) {
        console.log(`  - ${skill}`);
      }
    }
    return 0;
  }

  if (!skillArg) {
    program.help();
    return 1;
  }

  // Run evaluation
  console.log(`Evaluating skill: ${chalk.cyan(skillArg)}`);
  console.log(`Mode: ${useMock ? chalk.yellow("mock") : chalk.green("copilot")}`);
  console.log("-".repeat(50));

  let summary: EvaluationSummary;
  try {
    summary = await runner.run(skillArg, options.filter);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(chalk.red(`Error: ${message}`));
    return 1;
  }

  // Output results
  let output: string;

  if (options.output === "json") {
    output = JSON.stringify(summaryToDict(summary), null, 2);
  } else {
    const passRate =
      summary.totalScenarios > 0
        ? ((summary.passed / summary.totalScenarios) * 100).toFixed(1)
        : "N/A";

    const lines = [
      "",
      `Evaluation Summary: ${summary.skillName}`,
      "=".repeat(50),
      `Scenarios: ${summary.totalScenarios}`,
      `Passed: ${chalk.green(summary.passed.toString())}`,
      `Failed: ${summary.failed > 0 ? chalk.red(summary.failed.toString()) : "0"}`,
      `Pass Rate: ${passRate}%`,
      `Average Score: ${summary.avgScore.toFixed(1)}`,
      `Duration: ${summary.durationMs.toFixed(0)}ms`,
    ];

    if (summary.failed > 0) {
      lines.push("");
      lines.push(chalk.red("Failed Scenarios:"));
      for (const result of summary.results) {
        if (!result.passed) {
          lines.push(`  - ${result.scenario}`);
          for (const finding of result.findings) {
            if (finding.severity === Severity.ERROR) {
              lines.push(
                `      ${chalk.red(`[${finding.severity}]`)} ${finding.message}`
              );
            }
          }
        }
      }
    }

    output = lines.join("\n");
  }

  if (options.outputFile) {
    writeFileSync(options.outputFile, output);
    console.log(`Results written to: ${options.outputFile}`);
  } else {
    console.log(output);
  }

  // Return exit code based on pass rate
  return summary.failed === 0 ? 0 : 1;
}

// Run CLI
main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
