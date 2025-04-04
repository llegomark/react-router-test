// app/routes.ts
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    route("/", "./routes/home.tsx"),
    route("/reviewer/:categoryId", "./routes/quiz.tsx"),
    route("/results", "./routes/results.tsx"),
    route("/dashboard", "./routes/dashboard.tsx"),
    route("/copyright", "./routes/copyright.tsx"),
    route("*", "./routes/404.tsx"),
] satisfies RouteConfig;