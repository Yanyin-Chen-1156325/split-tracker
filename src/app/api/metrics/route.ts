import { collectDefaultMetrics, register, Counter } from 'prom-client'

collectDefaultMetrics()

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
})

export async function GET() {
  httpRequestsTotal.inc({ method: 'GET', path: '/api/metrics', status: '200' })
  
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType }
  })
}