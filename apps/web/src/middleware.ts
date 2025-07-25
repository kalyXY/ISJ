import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/', '/api'];

// Configuration des routes protégées par rôle
const roleRoutes = {
  admin: ['/admin'],
  teacher: ['/teacher'],
  student: ['/student'],
  parent: ['/parent'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permettre l'accès aux routes publiques
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Permettre l'accès aux ressources statiques
  if (
    pathname.includes('/_next') || 
    pathname.includes('/api/') ||
    pathname.includes('/favicon') ||
    pathname.includes('/icons') ||
    pathname.includes('/manifest')
  ) {
    return NextResponse.next();
  }

  // Vérifier le token JWT dans les cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // Rediriger vers la page de connexion si pas de token
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  try {
    // Vérifier et décoder le token
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
    const { payload } = await jwtVerify(token, secretKey);
    const userRole = payload.role as string;
    
    // Vérifier si l'utilisateur a accès à cette route
    let requiresRedirect = false;
    let targetRoute = '';
    
    for (const [role, routes] of Object.entries(roleRoutes)) {
      if (routes.some(route => pathname.startsWith(route)) && role !== userRole) {
        requiresRedirect = true;
        targetRoute = `/${userRole}/dashboard`;
        break;
      }
    }
    
    if (requiresRedirect) {
        // Rediriger vers le dashboard approprié si l'utilisateur n'a pas le bon rôle
      const dashboardUrl = new URL(targetRoute, request.url);
        return NextResponse.redirect(dashboardUrl);
    }
    
    // Permettre l'accès si l'utilisateur a le bon rôle
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    
    // Si erreur d'expiration, supprimer le cookie et rediriger vers login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    
    return response;
  }
}

// Configurer les chemins sur lesquels le middleware s'applique
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}; 