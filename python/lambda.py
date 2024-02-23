import boto3
import json
import uuid
from datetime import datetime
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('s3_bucket-details')
 
def lambda_handler(event, context):
    for record in event['Records']:
        bucket_name = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']
        event_timestamp = record['eventTime']
        event_type = record['eventName']
 
        if event_type == 'ObjectCreated:Put':
            item_id = str(uuid.uuid4())
            object_name = object_key.split('/')[-1]
            # Perform action for S3 put event
            # Log the entry into DynamoDB
            try:
                table.put_item(
                    Item = {
                    'id': item_id,  
                    'bucket_name': bucket_name,
                    'object_key': object_key,
                      'object_name': object_name,
                    'event_timestamp': event_timestamp,
                    'processing_timestamp': str(datetime.now())
                }
                )
            except Exception as e:
                print(f"Error storing object details in DynamoDB: {e}")
        elif event_type == 'ObjectRemoved:Delete':
            response = table.get_item(
                Key={
                    'object_key': object_key,
                    'bucket_name': bucket_name
                }
            )
            item = response.get('Item')
            if item:
                # Item found, retrieve item_id
                item_id = item.get('item_id')
            # Perform action for S3 delete event
            # Remove corresponding entry from DynamoDB
                try:
                    table.delete_item(
                        Key={
                            'item_id': item_id,
                        }
                    )
                except Exception as e:
                    print(f"Error removing object details in DynamoDB: {e}")
        else:
            print(f"Ignoring event type: {event_type}")
 
    return {
        'statusCode': 200,
        'body': json.dumps('Operation successful')
    }




