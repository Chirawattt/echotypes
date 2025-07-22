## route.ts app/api/auth/[...nextauth]/route.ts
Module '"next-auth"' has no exported member 'NextAuthOptions'.
Binding element 'user' implicitly has an 'any' type.
Binding element 'account' implicitly has an 'any' type.
Binding element 'url' implicitly has an 'any' type.
Binding element 'baseUrl' implicitly has an 'any' type.
Binding element 'session' implicitly has an 'any' type.
Binding element 'token' implicitly has an 'any' type.
Binding element 'token' implicitly has an 'any' type.
Binding element 'user' implicitly has an 'any' type.
Binding element 'account' implicitly has an 'any' type.
This expression is not callable.
  Type 'typeof import("next-auth")' has no call signatures.


### route.ts app/api/auth/register
Module '"../[...nextauth]/route"' declares 'authOptions' locally, but it is not exported.

### route.ts app/api/profile
Module '"@/app/api/auth/[...nextauth]/route"' declares 'authOptions' locally, but it is not exported.

### route.ts app/api/scores
Module '"../auth/[...nextauth]/route"' declares 'authOptions' locally, but it is not exported.

### route.ts app/api/test-auth
Module '"../auth/[...nextauth]/route"' declares 'authOptions' locally, but it is not exported.

### page.tsx app/auth/check-registraion
React Hook useEffect has missing dependencies: 'checkUserRegistration' and 'router'. Either include them or remove the dependency array.

### page.tsx app/auth/signup
React Hook useEffect has missing dependencies: 'checkUserRegistration' and 'router'. Either include them or remove the dependency array.
Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

### page.tsx app
React Hook useEffect has missing dependencies: 'checkUserRegistration' and 'router'. Either include them or remove the dependency array.