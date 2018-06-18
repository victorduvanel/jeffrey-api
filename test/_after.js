import 'babel-polyfill';

after(async () => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

