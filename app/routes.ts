// app/routes.ts
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    route("/", "./routes/home.tsx"),
    route("/quiz/:categoryId", "./routes/quiz.tsx"),
    route("/results", "./routes/results.tsx"),
    route("/dashboard", "./routes/dashboard.tsx"),
] satisfies RouteConfig;