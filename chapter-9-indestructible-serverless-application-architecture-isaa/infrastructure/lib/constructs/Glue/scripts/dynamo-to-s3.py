try:
    import sys
    from awsglue.transforms import *
    from awsglue.utils import getResolvedOptions
    from pyspark.context import SparkContext
    from awsglue.context import GlueContext
    from awsglue.job import Job
except Exception as e:
    pass

# Fetching arguments
arguments = getResolvedOptions(
    sys.argv, ["JOB_NAME", "GLUE_DATABASE_NAME",
                "GLUE_TABLE_NAME", "TARGET_S3_BUCKET"]
)

# Initializing contexts
spark_context = SparkContext()
glue_context = GlueContext(spark_context)
spark = glue_context.spark_session
job = Job(glue_context)

# Initializing the job by its name and passing along arguments
job.init(arguments["JOB_NAME"], arguments)

# Getting variables from arguments
glue_database_name = arguments["GLUE_DATABASE_NAME"]
glue_table_name = arguments["GLUE_TABLE_NAME"]
target_s3_bucket_path = arguments["TARGET_S3_BUCKET"]

# Creating a dynamic frame from the table populated by the crawler
dynamodb_table_frame_node = glue_context.create_dynamic_frame.from_catalog(
    database=glue_database_name,
    table_name=glue_table_name,
    transformation_ctx="dynamodb_table_frame_node",
)

# Applying the mappings to the dumped data
apply_mapping_node = ApplyMapping.apply(
    frame=dynamodb_table_frame_node,
    mappings=[
        ("todo_description", "string", "todo_description", "string"),
        ("todo_name", "string", "todo_name", "string"),
        ("id", "string", "id", "string"),
        ("todo_completed", "string", "todo_completed", "string"),
    ],
    transformation_ctx="apply_mapping_node",
)

# Saving mapped data to S3
s3_bucket_node = glue_context.write_dynamic_frame.from_options(
    frame=apply_mapping_node,
    connection_type="s3",
    format="json",
    connection_options={
        "path": target_s3_bucket_path,
        "partitionKeys": [],
    },
    transformation_ctx="s3_bucket_node",
)

job.commit()
