import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { initExampleWorkflow } from './workflows/example'

// Create a new Hono app instance
const app = new Hono()

// Define routes
app.get('/', (c) => {
    return c.json({
        message: 'Hello from Hono!'
    })
})

app.get('/example-workflow', async (c) => {
    initExampleWorkflow();
    return c.json({
        message: 'Workflow executed successfully'
    })
})

// Start the server
const port = 8080
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
