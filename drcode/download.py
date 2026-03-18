import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Target URL
base_url = "http://mriaz-khan.com/managed-services/includes/mrk/img/"
output_folder = "img_downloads"

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Fetch HTML content
response = requests.get(base_url)
soup = BeautifulSoup(response.text, "html.parser")

# Find and download each file
for link in soup.find_all("a"):
    href = link.get("href")
    if href and not href.startswith("?") and not href.startswith("/"):
        file_url = urljoin(base_url, href)
        print(f"⬇ Downloading: {file_url}")
        
        file_path = os.path.join(output_folder, href)
        with open(file_path, "wb") as f:
            f.write(requests.get(file_url).content)

print("✅ Download complete.")
