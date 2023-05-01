import AWS from 'aws-sdk';

interface IEvent {
  Records: {
    eventID: string;
    eventName: string;
    eventVersion: string;
    eventSource: string;
    awsRegion: string;
    dynamodb: {
      Keys: {
        [key: string]: {
          [key: string]: string | number | object;
        };
      };
      NewImage: {
        [key: string]: {
          [key: string]: string | number | object;
        };
      };
      ApproximateCreationDateTime: number;
      SequenceNumber: string;
      SizeBytes: number;
      StreamViewType: string;
    };
    eventSourceARN: string;
  }[];
}

const ses = new AWS.SES();

export const handler = async (event: IEvent) => {
  try {
    console.log('Dynamo stream event: ', event);

    const { eventName } = event.Records[0];

    if (eventName === 'INSERT') {
      const newItem = event.Records[0].dynamodb.NewImage;
      const emailAddress = process.env.EMAIL_ADDRESS || '';

      const message = `A new item was added to the DynamoDB table:\n\n${JSON.stringify(
        newItem,
        null,
        2,
      )}`;

      const params = {
        Destination: {
          ToAddresses: [emailAddress], // Replace with your email address
        },
        Message: {
          Body: {
            Text: {
              Data: message,
            },
          },
          Subject: {
            Data: 'New item added to DynamoDB table', // Replace with your subject line
          },
        },
        Source: emailAddress, // Replace with your email address
      };

      await ses.sendEmail(params).promise();
      console.log(`Email sent: ${message}`);
    }
    return;
  } catch (error) {
    console.error(error);
  }
};
