import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Admin routes protection
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }

        // Dashboard routes protection
        if (pathname.startsWith("/dashboard")) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
}