import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, type Plugin } from "vite"

function ignoreChromeDevtoolsProbe(): Plugin {
  const path = "/.well-known/appspecific/com.chrome.devtools.json"
  const serveEmpty = (req: { url?: string }, res: { statusCode: number; end: () => void }, next: () => void) => {
    if (req.url?.startsWith(path)) {
      res.statusCode = 204
      res.end()
      return
    }
    next()
  }

  return {
    name: "ignore-chrome-devtools-probe",
    configureServer(server) {
      server.middlewares.use(serveEmpty)
    },
  }
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [ignoreChromeDevtoolsProbe(), tailwindcss(), reactRouter()],
})
