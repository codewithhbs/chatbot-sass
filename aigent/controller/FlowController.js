const BotConfig = require("../models/BotConfig");
const Website = require("../models/Website.Schema");


exports.MakeAFlowForABot = async (req, res) => {
  try {
    const { botId, metaCode } = req.params;
    const {

      name,
      description,
      welcomeMessage,
      endMessage,
      steps
    } = req.body;

    if (!welcomeMessage || !endMessage || !steps || steps.length === 0) {
      return res.status(400).json({ message: "Please provide welcome message, end message, and at least one step" });
    }

    const website = await Website.findById(botId);
    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }

    //   if (website.metaCode !== metaCode) {
    //     return res.status(400).json({ message: "Meta code does not match with the website" });
    //   }

    const checkExistingFlow = await BotConfig.findOne({ botId });
    if (checkExistingFlow) {
      return res.status(400).json({ message: "Flow already exists for this bot" });
    }

    // Validate steps
    let hasStartNode = false;
    let hasEndNode = false;
    const stepIds = new Set();

    for (const step of steps) {
      const { stepId, type, question, options = [], isStart, isEnd } = step;

      if (!stepId || !type || !question) {
        return res.status(400).json({
          message: "Invalid step structure. Each step must have stepId, type, and question"
        });
      }

      if (stepIds.has(stepId)) {
        return res.status(400).json({ message: `Duplicate stepId found: ${stepId}` });
      }
      stepIds.add(stepId);

      if (isStart) hasStartNode = true;
      if (isEnd) hasEndNode = true;

      if (['dropdown', 'multiselect'].includes(type)) {
        if (!Array.isArray(options) || options.length === 0) {
          return res.status(400).json({
            message: `Step ${stepId} is of type ${type} but has no options`
          });
        }
      }
    }

    if (!hasStartNode) {
      return res.status(400).json({ message: "Flow must have exactly one start node" });
    }

    if (!hasEndNode) {
      return res.status(400).json({ message: "Flow must have at least one end node" });
    }

    const newFlow = await BotConfig.create({
      botId,
      metaCode,
      name,
      description,
      welcomeMessage,
      endMessage,
      steps,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json({
      message: "Bot flow created successfully",
      data: newFlow
    });

  } catch (error) {
    console.error("Error in MakeAFlowForABot:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


/**
 * Get flow for a bot
 */
exports.GetBotFlow = async (req, res) => {
  try {
    const { botId, metaCode } = req.params;


    const flow = await BotConfig.findOne({ metaCode: metaCode });
    if (!flow) {
      return res.status(404).json({ message: "No flow exists for this bot" });
    }

    return res.status(200).json({
      message: "Bot flow retrieved successfully",
      data: flow
    });

  } catch (error) {
    console.error("Error in GetBotFlow:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



/**
 * Delete flow for a bot
 */
exports.DeleteBotFlow = async (req, res) => {
  try {
    const { botId } = req.params;
    const { metCode } = req.body;

    const website = await Website.findById(botId);
    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }

    if (website.metaCode !== metCode) {
      return res.status(400).json({ message: "Meta code does not match with the website" });
    }

    const flow = await BotConfig.findOneAndDelete({ botId });
    if (!flow) {
      return res.status(404).json({ message: "No flow exists for this bot" });
    }

    return res.status(200).json({
      message: "Bot flow deleted successfully"
    });

  } catch (error) {
    console.error("Error in DeleteBotFlow:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};