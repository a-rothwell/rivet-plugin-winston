// src/nodes/WinstonNode.ts
function WinstonPluginNode(rivet) {
  const WinstonPluginNodeImpl = {
    // This should create a new instance of your node type from scratch.
    create() {
      const node = {
        // Use rivet.newId to generate new IDs for your nodes.
        id: rivet.newId(),
        // This is the default data that your node will store
        data: {
          logLevel: "info"
        },
        // This is the default title of your node.
        title: "Winston Plugin Node",
        // This must match the type of your node.
        type: "WinstonPlugin",
        // X and Y should be set to 0. Width should be set to a reasonable number so there is no overflow.
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    // This function should return all input ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getInputDefinitions(data, _connections, _nodes, _project) {
      const inputs = [];
      if (data.useLogLevelInput) {
        inputs.push({
          id: "logLevel",
          dataType: "string",
          title: "Log Level"
        });
      }
      inputs.push({
        id: "logMessage",
        dataType: "string",
        title: "Log Message"
      });
      inputs.push({
        id: "logMetaData",
        dataType: "object",
        title: "Log Data"
      });
      return inputs;
    },
    // This function should return all output ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getOutputDefinitions(_data, _connections, _nodes, _project) {
      return [];
    },
    // This returns UI information for your node, such as how it appears in the context menu.
    getUIData() {
      return {
        contextMenuTitle: "Winston Logger",
        group: "Logging",
        infoBoxBody: "This is a plugin node that logs with Winston",
        infoBoxTitle: "Winston Node"
      };
    },
    // This function defines all editors that appear when you edit your node.
    getEditors(_data) {
      return [
        {
          type: "dropdown",
          dataKey: "logLevel",
          useInputToggleDataKey: "useLogLevelInput",
          label: "Log Level",
          options: [
            { label: "Error", value: "error" },
            { label: "Warn", value: "warn" },
            { label: "Info", value: "info" },
            { label: "Verbose", value: "verbose" },
            { label: "Debug", value: "debug" },
            { label: "Silly", value: "silly" }
          ]
        }
      ];
    },
    // This function returns the body of the node when it is rendered on the graph. You should show
    // what the current data of the node is in some way that is useful at a glance.
    getBody(data) {
      return rivet.dedent`
        Log Level: ${data.useLogLevelInput ? "(Using Input)" : data.logLevel}
      `;
    },
    // This is the main processing function for your node. It can do whatever you like, but it must return
    // a valid Outputs object, which is a map of port IDs to DataValue objects. The return value of this function
    // must also correspond to the output definitions you defined in the getOutputDefinitions function.
    async process(data, inputData, context) {
      const { winston } = await import("../dist/nodeEntry.cjs");
      const fileTransport = context.settings.pluginSettings?.winstonRivetPlugin?.fileTransport ?? "winston.log";
      const logLevel = data.logLevel;
      const logMessage = inputData["logMessage"]?.value;
      const logMetaData = inputData["logMetaData"]?.value;
      const logger = winston.createLogger({
        level: logLevel,
        exitOnError: false,
        format: winston.format.json(),
        transports: [
          new winston.transports.File({ filename: fileTransport })
        ]
      });
      logger.log({
        level: logLevel,
        message: logMessage,
        meta: logMetaData
      });
      return {};
    }
  };
  const WinstonPluginNode2 = rivet.pluginNodeDefinition(
    WinstonPluginNodeImpl,
    "Winston Logger"
  );
  return WinstonPluginNode2;
}

// src/index.ts
var plugin = (rivet) => {
  const winstonNode = WinstonPluginNode(rivet);
  const winstonPlugin = {
    // The ID of your plugin should be unique across all plugins.
    id: "winstonRivetPlugin",
    // The name of the plugin is what is displayed in the Rivet UI.
    name: "Winston",
    // Define all configuration settings in the configSpec object.
    configSpec: {
      fileTransport: {
        type: "string",
        label: "File Path to Log File",
        description: "File Path to Log File"
      }
    },
    // Define any additional context menu groups your plugin adds here.
    contextMenuGroups: [
      {
        id: "logging",
        label: "Logging"
      }
    ],
    // Register any additional nodes your plugin adds here. This is passed a `register`
    // function, which you can use to register your nodes.
    register: (register) => {
      register(winstonNode);
    }
  };
  return winstonPlugin;
};
var src_default = plugin;
export {
  src_default as default
};
