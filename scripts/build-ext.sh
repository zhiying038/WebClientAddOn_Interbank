subtitle=$1

echo "Building extension $subtitle"

if [ -z "$subtitle" ]
then
    
    pnpm build && pnpm dlx mbt build

else


    # replace empty spaces with hyphens and remove special chracaters in $subtitle
    id_suffix="$(echo $subtitle | sed 's/ /-/g' | sed 's/[^a-zA-Z0-9-]//g')"

    # Read the current ID from mta.yaml
    current_id=$(grep '^ID:' mta.yaml | awk '{print $2}')

    # Append suffix to ID in the mta.yaml
    sed -i.bak "s/ID: $current_id/ID: $current_id-$id_suffix/g" mta.yaml

    # escape regex characters in $subtitle
    escaped_subtitle=$(echo $subtitle | sed 's/[&/\]/\\&/g')

    # replace default subtitle in public/WebClientExtension.json with $subtitle
    sed -i.bak "s/\"subtitle\".*\"/\"subtitle\": \"$escaped_subtitle\"/g" public/WebClientExtension.json

    pnpm build && pnpm dlx mbt build

    # replace back with backup files
    mv mta.yaml.bak mta.yaml
    mv public/WebClientExtension.json.bak public/WebClientExtension.json

fi