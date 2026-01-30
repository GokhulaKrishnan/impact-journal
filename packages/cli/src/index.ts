import { Command } from "commander";
import { login } from "./commands/login";
import { logout } from "./commands/logout";
import { status } from "./commands/status";

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

program.parse();
