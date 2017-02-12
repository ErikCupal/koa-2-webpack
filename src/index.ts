import koa, { Context } from 'koa'
import webpack, { Configuration } from 'webpack'
import devMiddleware, { Options } from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import compose from 'koa-compose'
const convert = require('koa-convert')

export type Compiler = webpack.Compiler
export type Middleware = (context: koa.Context, next: () => Promise<any>) => Promise<void>

export const webpackDevMiddleware = (compiler: Compiler, options?: Options): Middleware => {
  const dev = devMiddleware(compiler, options)

  const waitMiddleware = () => {
    return new Promise((resolve, reject) => {
      dev.waitUntilValid(() => {
        resolve(true)
      })

      compiler.plugin('failed', (error) => {
        reject(error)
      })
    })
  }

  return async (context: Context, next: () => Promise<any>) => {
    await waitMiddleware()
    await dev(context.req, {
      end: (content: any) => {
        context.body = content
      },
      setHeader: context.set.bind(context)
    } as any, next)
  }
}

export const webpackHotMiddleware = (compiler: Compiler): Middleware => convert(((compiler: Compiler) => {
  const hot = hotMiddleware(compiler)

  return function* oldHotMiddleware(next: any) {
    // tslint:disable-next-line:no-invalid-this
    const { req, res } = this

    yield (done: any) => {
      hot(req, res, () => {
        // tslint:disable-next-line:no-null-keyword
        done(null)
      })
    }

    yield next
  }
})(compiler))

const webpackMiddleware = ({ config, dev }: {
  config: Configuration,
  dev: Options,
}) => {

  const compiler = webpack(config)

  return compose([
    webpackDevMiddleware(compiler, dev),
    webpackHotMiddleware(compiler),
  ])
}

export default webpackMiddleware