def deleteObjectVersionsExceptOriginal(bucketName, objectKey, s3Client):
    versions = s3Client.list_object_versions(Bucket=bucketName, Prefix=objectKey)[
        "Versions"
    ]

    if len(versions) > 1:
        newVersions = versions[:-1]

        def createDeleteContainer(version):
            return {"Key": objectKey, "VersionId": version["VersionId"]}

        versionDeleteResponse = s3.delete_objects(
            Bucket=bucketName,
            Delete={"Objects": [createDeleteContainer(v) for v in newVersions]},
        )

        print(versionDeleteResponse)
