from bs4 import BeautifulSoup
import os
import re


def find_files_by_pattern(root_folder, pattern):
    """
    Search for files that match a regular expression pattern within a directory tree.

    :param root_folder: The directory to start the search from.
    :param pattern: The regex pattern to match the filename.
    :return: A list of paths to files matching the pattern.
    """
    matched_files = []
    regex = re.compile(pattern)
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for filename in filenames:
            if regex.match(filename):
                matched_files.append(os.path.join(dirpath, filename))
    return matched_files


# Read the HTML file
with open("./dist/index.html", "r", encoding="utf-8") as file:
    html_content = file.read()

soup = BeautifulSoup(html_content, "html.parser")

# Add tags to the <head>
script = soup.new_tag(
    "script",
    crossorigin="true",
    type="module",
    src=find_files_by_pattern("./dist/assets/", r"index\.........\.js")[0][6:],
)
css = soup.new_tag(
    "link",
    crossorigin="true",
    rel="stylesheet",
    href=find_files_by_pattern("./dist/assets/", r"index\.........\.css")[0][6:],
)
soup.head.append(script)
soup.head.append(css)

# Write the modified HTML back to a file
with open("./dist/index.html", "w", encoding="utf-8") as file:
    file.write(str(soup))
