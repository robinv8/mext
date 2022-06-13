#!/usr/bin/env node
import minimist from 'minimist'
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import Service from './Service';

class CLI {
  run() {
    clear();
    console.log(
      chalk.red(figlet.textSync('uext-cli', { horizontalLayout: 'full' })),
    );
    this.parseArgs()
  }
  parseArgs() {
    const args = minimist(process.argv.slice(2))
    const _ = args._
    const command = _[0]
    switch (command) {
      case 'generate':
        const service = new Service();
        service.run();
        break;
    }
  }
}

export default CLI;
