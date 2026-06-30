import { AUTH_ROLES, type AuthRole, type CurrentUser } from "@/lib/api/types";

export const PUBLIC_PATHS = ["/login", "/unauthorized"] as const;

export function resolveRole(
  input: AuthRole | CurrentUser | null | undefined,
): AuthRole | null {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    return AUTH_ROLES.includes(input as AuthRole) ? input : null;
  }
  
  return input.user.role as any;
}

export function getDefaultRouteForRole(role: AuthRole | null | undefined) {
  switch (role) {
    case "MANAGER":
      return "/";
    case "PROFESSOR":
      return "/modules";
    case "ASSISTANT":
      return "/sessions";
    default:
      return "/";
  }
}

export function getAccessibleHomeRoute(
  input: AuthRole | CurrentUser | null | undefined,
) {
  return getDefaultRouteForRole(resolveRole(input));
}

export function isManager(input: AuthRole | CurrentUser | null | undefined) {
  return resolveRole(input) === "MANAGER";
}

export function isProfessor(input: AuthRole | CurrentUser | null | undefined) {
  return resolveRole(input) === "PROFESSOR";
}

export function isAssistant(input: AuthRole | CurrentUser | null | undefined) {
  return resolveRole(input) === "ASSISTANT";
}

export function hasAnyRole(
  input: AuthRole | CurrentUser | null | undefined,
  allowedRoles: readonly AuthRole[],
) {
  const role = resolveRole(input);

  if (!role) {
    return false;
  }

  if (role === "MANAGER") {
    return true;
  }

  return allowedRoles.includes(role);
}

type RouteAccessRule = {
  path: string;
  allowedRoles?: readonly AuthRole[];
  public?: boolean;
};

const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { path: "/login", public: true },
  { path: "/unauthorized", public: true },
  { path: "/admins", allowedRoles: ["MANAGER"] },
  { path: "/departments", allowedRoles: ["MANAGER"] },
  { path: "/admins/create", allowedRoles: ["MANAGER"] },
  { path: "/admins/:id/edit", allowedRoles: ["MANAGER"] },
  { path: "/admins/:id", allowedRoles: ["MANAGER"] },
  { path: "/students/create", allowedRoles: ["MANAGER"] },
  { path: "/students/import", allowedRoles: ["MANAGER"] },
  { path: "/students/:id/edit", allowedRoles: ["MANAGER"] },
  { path: "/students/:id", allowedRoles: ["MANAGER"] },
  { path: "/departments/new", allowedRoles: ["MANAGER"] },
  { path: "/classes/new", allowedRoles: ["MANAGER"] },
  { path: "/students/new", allowedRoles: ["MANAGER"] },
  { path: "/modules/create", allowedRoles: ["MANAGER"] },
  { path: "/modules/:id/edit", allowedRoles: ["MANAGER"] },
  { path: "/modules/:id", allowedRoles: ["MANAGER", "PROFESSOR", "ASSISTANT"] },
  { path: "/modules", allowedRoles: ["MANAGER", "PROFESSOR", "ASSISTANT"] },
  { path: "/sessions/create", allowedRoles: ["MANAGER"] },
  { path: "/sessions/:id/edit", allowedRoles: ["MANAGER"] },
  {
    path: "/sessions/:id",
    allowedRoles: ["MANAGER", "PROFESSOR", "ASSISTANT"],
  },
  { path: "/sessions", allowedRoles: ["MANAGER", "PROFESSOR", "ASSISTANT"] },
];

function matchesRoute(pathname: string, pattern: string) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);

  if (pathSegments.length !== patternSegments.length) {
    return pathname === pattern;
  }

  return patternSegments.every((segment, index) => {
    if (segment.startsWith(":")) {
      return true;
    }

    return segment === pathSegments[index];
  });
}

export function getRouteAccess(pathname: string): RouteAccessRule {
  const match = [...ROUTE_ACCESS_RULES]
    .sort((left, right) => right.path.length - left.path.length)
    .find((rule) => matchesRoute(pathname, rule.path));

  return match ?? { path: pathname };
}

export function canAccessRoute(
  user: AuthRole | CurrentUser | null | undefined,
  pathname: string,
) {
  const access = getRouteAccess(pathname);
  const role = resolveRole(user);

  if (access.public) {
    return true;
  }

  if (role === "MANAGER") {
    return true;
  }

  if (!access.allowedRoles || access.allowedRoles.length === 0) {
    return Boolean(role);
  }

  return hasAnyRole(user, access.allowedRoles);
}
