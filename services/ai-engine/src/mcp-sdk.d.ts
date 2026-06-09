declare module "@modelcontextprotocol/sdk/server" {
  import type { IncomingMessage, ServerResponse } from "node:http"
  import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types"

  interface ServerOptions {
    capabilities?: Record<string, unknown>
  }

  export class Server {
    constructor(info: { name: string; version: string }, options?: ServerOptions)
    setRequestHandler(schema: object, handler: (request: any) => Promise<any>): void
    connect(transport: SSEServerTransport): Promise<void>
  }
}

declare module "@modelcontextprotocol/sdk/server/sse" {
  import type { IncomingMessage, ServerResponse } from "node:http"

  export class SSEServerTransport {
    constructor(endpoint: string, res: ServerResponse)
    handlePostMessage(req: IncomingMessage, res: ServerResponse, parsedBody?: string): Promise<void>
    readonly sessionId: string
    close(): Promise<void>
  }
}

declare module "@modelcontextprotocol/sdk/types" {
  export const ListToolsRequestSchema: object
  export const CallToolRequestSchema: object
  export const ListResourcesRequestSchema: object
  export const ListResourceTemplatesRequestSchema: object
  export const ReadResourceRequestSchema: object
  export type JSONRPCMessage = unknown
}
