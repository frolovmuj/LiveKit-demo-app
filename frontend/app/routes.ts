import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/Home.tsx'),
  route('/login', 'routes/Login.tsx'),
  route('/m/:id', 'routes/Meeting.tsx'),
] satisfies RouteConfig;
