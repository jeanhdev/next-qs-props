import { NextRequest, NextResponse, NextMiddleware } from 'next/server'

export const makeMiddleware = (option: {
  activeWhen?: (request: NextRequest) => boolean
  keys: string[]
}): NextMiddleware => {
  return (req: NextRequest) => {
    if (!(option.activeWhen ?? (() => true))(req)) return

    const params = option.keys
      .reduce<string[]>((res, key) => {
        const val = req.nextUrl.searchParams.get(key)
        return val ? [...res, `${key}-${val}`] : res
      }, [])
      .sort()
      .join('/')
    if (!params) return

    // next.js <= 12.0.8
    if (!req.nextUrl.clone) {
      return NextResponse.rewrite(
        `${req.nextUrl.pathname}/${params}`.replace(/\/\//, '/')
      )
    }

    // next.js >= 12.0.9
    const url = req.nextUrl.clone()
    url.pathname = (url.pathname + `/${params}`).replace(/\/\//, '/')

    return NextResponse.rewrite(url)
  }
}
