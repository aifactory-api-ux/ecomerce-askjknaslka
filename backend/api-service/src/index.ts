import app from './app';

const PORT = process.env.PORT || 23001;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shut down');
  });
});