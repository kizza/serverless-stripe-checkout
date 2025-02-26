import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { ContextualError } from "../util";
import { asSuccess } from "./gateway";

const sns = new SNSClient();

export const publishToTopic = async (message: string, topicArn: string) => {
  const command = new PublishCommand({
    Message: message,
    TopicArn: topicArn,
  });

  return sns.send(command)
    .then(data => asSuccess(`Marco!? (sent ${data.MessageId})`))
    .catch(e => {
      throw new ContextualError("Error parsing stripe event", e)
    });
};

