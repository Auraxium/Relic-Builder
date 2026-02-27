import xml.etree.ElementTree as ET
import json

def xml_to_dict(file_path):
    # 1. Load and parse the XML file
    tree = ET.parse(file_path)
    root = tree.getroot()

    result = {}

    # 2. Find all <text> elements anywhere in the document
    for text_tag in root.iter('text'):
        # Extract the 'id' attribute
        item_id = text_tag.get('id')
        
        # Extract the text content
        content = text_tag.text
        
        # Optional: Clean up data (handle %null% or empty tags)
        if content == "%null%" or content is None or content == "null":
            content = None  # Converts to null in JSON
        
        if item_id:
            result[item_id] = content

    return result

# Usage
data_dict = xml_to_dict('D:\VS_Codes\Relic_Builder\src\AntiqueName_dlc01.fmg.xml')

# 3. Convert to JSON string
json_output = json.dumps(data_dict, indent=4)
print(json_output)