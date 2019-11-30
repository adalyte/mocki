import chalk from 'chalk';

const info = (message, prefix = '') => {
  console.log(prefix, chalk.green(`${prefix}${message}`));
};

const white = (message, prefix = '') => {
  console.log(prefix, chalk.white(`${prefix}${message}`));
};

const error = (message, prefix = '') => {
  console.log(prefix, chalk.red(`${prefix}${message}`));
};

export default {
  info,
  white,
  error
};
