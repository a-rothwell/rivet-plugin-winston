// **** IMPORTANT ****
// Make sure you do `import type` and do not pull in the entire Rivet core library here.
// Export a function that takes in a Rivet object, and you can access rivet library functionality
// from there.
import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from "@ironclad/rivet-core";

// This defines your new type of node.
export type WinstonPluginNode = ChartNode<
  "WinstonPlugin",
  WinstonPluginNodeData
>;

// This defines the data that your new node will store.
export type WinstonPluginNodeData = {
  logLevel: string;
  useLogLevelInput?: boolean;
};

// Make sure you export functions that take in the Rivet library, so that you do not
// import the entire Rivet core library in your plugin.
export function WinstonPluginNode(rivet: typeof Rivet) {
  // This is your main node implementation. It is an object that implements the PluginNodeImpl interface.
  const WinstonPluginNodeImpl: PluginNodeImpl<WinstonPluginNode> = {
    // This should create a new instance of your node type from scratch.
    create(): WinstonPluginNode {
      const node: WinstonPluginNode = {
        // Use rivet.newId to generate new IDs for your nodes.
        id: rivet.newId<NodeId>(),

        // This is the default data that your node will store
        data: {
          logLevel: "info",
        },

        // This is the default title of your node.
        title: "Winston Plugin Node",

        // This must match the type of your node.
        type: "WinstonPlugin",

        // X and Y should be set to 0. Width should be set to a reasonable number so there is no overflow.
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },

    // This function should return all input ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getInputDefinitions(
      data: WinstonPluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useLogLevelInput) {
        inputs.push({
          id: "logLevel" as PortId,
          dataType: "string",
          title: "Log Level",
        });
      }

      inputs.push({
        id: "logMessage" as PortId,
        dataType: "string",
        title: "Log Message",
      });

      inputs.push({
        id: "logMetaData" as PortId,
        dataType: "object",
        title: "Log Data",
      });

      return inputs;
    },

    // This function should return all output ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getOutputDefinitions(
      _data: WinstonPluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeOutputDefinition[] {
      return [];
    },

    // This returns UI information for your node, such as how it appears in the context menu.
    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Winston Logger",
        group: "Logging",
        infoBoxBody: "This is a plugin node that logs with Winston",
        infoBoxTitle: "Winston Node",
      };
    },

    // This function defines all editors that appear when you edit your node.
    getEditors(
      _data: WinstonPluginNodeData
    ): EditorDefinition<WinstonPluginNode>[] {
      return [ 
        {
          type: "dropdown",
          dataKey: "logLevel",
          useInputToggleDataKey: "useLogLevelInput",
          label: "Log Level",
          options: [
            {label: 'Error', value: 'error'}, 
            {label: 'Warn', value: 'warn'}, 
            {label: 'Info', value: 'info'}, 
            {label: 'Verbose', value: 'verbose'}, 
            {label: 'Debug', value: 'debug'}, 
            {label: 'Silly', value: 'silly'}
          ]
        }
      ];
    },

    // This function returns the body of the node when it is rendered on the graph. You should show
    // what the current data of the node is in some way that is useful at a glance.
    getBody(
      data: WinstonPluginNodeData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        Log Level: ${data.useLogLevelInput ? "(Using Input)" : data.logLevel}
      `;
    },

    // This is the main processing function for your node. It can do whatever you like, but it must return
    // a valid Outputs object, which is a map of port IDs to DataValue objects. The return value of this function
    // must also correspond to the output definitions you defined in the getOutputDefinitions function.
    async process(
      data: WinstonPluginNodeData,
      inputData: Inputs,
      context: InternalProcessContext
    ): Promise<Outputs> {

      const { winston } = await import("../nodeEntry");

      const fileTransport = context.settings.pluginSettings?.winstonRivetPlugin?.fileTransport as string ?? 'winston.log';

      const logLevel = data.logLevel
      const logMessage = inputData['logMessage' as PortId]?.value as string;
      const logMetaData = inputData['logMetaData' as PortId]?.value as object;


      const logger = winston.createLogger({
        level: logLevel,
        exitOnError: false,
        format: winston.format.json(),
        transports: [
          new winston.transports.File({ filename: fileTransport}),
        ],
      });

      logger.log({
        level: logLevel,
        message: logMessage,
        meta: logMetaData
      });

      return {

      };
    },
  };

  // Once a node is defined, you must pass it to rivet.pluginNodeDefinition, which will return a valid
  // PluginNodeDefinition object.
  const WinstonPluginNode = rivet.pluginNodeDefinition(
    WinstonPluginNodeImpl,
    "Winston Logger"
  );

  // This definition should then be used in the `register` function of your plugin definition.
  return WinstonPluginNode;
}
