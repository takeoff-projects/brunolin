from google.cloud import datastore
from google.cloud import storage
import json
import random


datastore_client = datastore.Client()
storage_client = storage.Client()

class EtlError:
    def __init__(self, filename="",errors=[]):
        self.filename = filename
        self.errors = errors
    
    def todict(self):
        return {"filename":self.filename,"errors":self.errors}

def gcs_trigger(event, context):
    """Background Cloud Function to be triggered by Cloud Storage.
       This generic function logs relevant data when a file is changed.
    Args:
        event (dict):  The dictionary with data specific to this type of event.
                       The `data` field contains a description of the event in
                       the Cloud Storage `object` format described here:
                       https://cloud.google.com/storage/docs/json_api/v1/objects#resource
        context (google.cloud.functions.Context): Metadata of triggering event.
    Returns:
        None; the output is written to Stackdriver Logging
    """

    bucket = storage_client.get_bucket(event['bucket'])
    blob = bucket.blob(event['name'])
    data = json.loads(blob.download_as_string(client=None))
    
#     etl_errors = [
#     {
#         "filename": "fdfd",
#         "errors": [
#             {"id": "43432", "line_errors": ["fddfd", "fdfdfd"]},
#             {"id": "67869", "line_errors": ["fddfd", "fdfdfd"]},
#         ],
#     }
# ]

   # validation
    temp_zones= ["cool","room","frozen"]
    categories = ["diary","candy","produce","meat","bread","other"]

    prod_errors=[]
    for product in data:
        line_errors=[]
        # prod_errors.append({"id":product["id"],"line_errors":[]})

        print("Validation Checking for id: {0}".format(product["prodId"]))
        if product["temp"].lower() not in temp_zones:
            print("invalid temp zone")
            line_errors.append("Invalid temp zone")

        if product["category"].lower() not in categories:
            print ("Invalid category")
            line_errors.append("Invalid category")
        

        if line_errors:
            line_errors.append("Random error {0}".format(random.randint(0,100)))
            prod_errors.append({"id":product["prodId"],"line_errors":line_errors})
        else:
            prod_key=datastore_client.key("Product",product["prodId"])
            prod_entity = datastore.Entity(prod_key)
            prod_entity["category"] = product["category"]
            prod_entity["Id"] = product["prodId"]
            prod_entity["Name"] = product["name"]
            prod_entity["TempZone"] = product["temp"]
            datastore_client.put(prod_entity)

    
    # write to datastore
    if prod_errors:
        file_errors=EtlError(filename=event["name"], errors=prod_errors)
        print(file_errors.todict())
        key = datastore_client.key("Etl", file_errors.filename)
        etl_entry = datastore.Entity(key=key)
        etl_entry["filename"]= file_errors.filename
        etl_entry["errors"] = file_errors.errors

        datastore_client.put(etl_entry)

    # The name/ID for the new entity
    # The Cloud Datastore key for the new entity
    task_key = datastore_client.key("Task", "sampletask2")

    # Prepares the new entity
    task = datastore.Entity(key=task_key)
    task["desc"] = "Complete cloud functions"
    datastore_client.put(task)



    print('Event ID: {}'.format(context.event_id))
    print('Event type: {}'.format(context.event_type))
    print('Bucket: {}'.format(event['bucket']))
    print('File: {}'.format(event['name']))
    print('Metageneration: {}'.format(event['metageneration']))
    print('Created: {}'.format(event['timeCreated']))
    print('Updated: {}'.format(event['updated']))