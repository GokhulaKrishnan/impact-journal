import { Command } from "commander";
import { login } from "./commands/login";
import { logout } from "./commands/logout";
import { status } from "./commands/status";
import { sync } from "./commands/sync";
import { summary } from "./commands/summary";
import { standup } from "./commands/standup";

const program = new Command();

program
  .name("impact")
  .description("Track your GitHub activity and generate career ready summaries")
  .version("0.1.0");

program
  .command("login")
  .description("Connect your GitHub account")
  .action(login);

program.command("status").description("Check login status").action(status);

program
  .command("logout")
  .description("Disconnect your GitHub account")
  .action(logout);

program
  .command("sync")
  .description("Fetch latest GitHub activity")
  .action(sync);

program
  .command("summary")
  .description("Get the data summary")
  .option("-p, --period <period>", "Time Period: today, week, month", "week")
  .action((options) => summary(options.period));

program
  .command("standup")
  .description("Generate standup message")
  .action(standup);

program.parse();
