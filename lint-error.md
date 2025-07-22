Conversion of type 'Session | null' to type 'Session & { user: { id: string; }; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Session' is not comparable to type 'Session & { user: { id: string; }; }'.
    Type 'import("d:/myNextJS/echotypes-frontend/node_modules/next-auth/core/types").Session' is not comparable to type 'import("next-auth").Session'.
      Types of property 'user' are incompatible.
        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not comparable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.
          Property 'id' is missing in type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }' but required in type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.ts(2352)
next-auth.d.ts(4, 7): 'id' is declared here.