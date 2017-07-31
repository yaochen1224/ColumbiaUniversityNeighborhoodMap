# Neighborhood Map of Columbia University


This Neighborhood Map is a single page web application which displays a series of tourist sites marked around Columbia University in the City of New York. It employs Google Map API and Wikipedia API for location information as well as Open Weather Map API to display the real-time weather. In this app, you can

  - Click the markers for more detailed information
  - Filter the markers by using search panel
  - Check the weather


### Getting started

To run this app, please download this repository and open index.html

To run a local server:

	1. 
	  ```bash
	  $> cd /path/to/your-project-folder
	  $> python -m SimpleHTTPServer 8080
	  ```

	2. Open a browser and visit localhost:8080
	3. Download and install [ngrok](https://ngrok.com/) to the top-level of your project directory to make your local server accessible remotely.

	  ``` bash
	  $> cd /path/to/your-project-folder
	  $> ./ngrok http 8080
	  ```

	4. Copy the public URL ngrok gives you and try running it through PageSpeed Insights!