# Step 4: AJAX requests with JQuery
This step purpose is to link our static and dynamic content. We will use AJAX requests with JQuery to do so. It will refresh dynamicaly the static content with the payload received from the dynamic at a fixed rate. In our case, the big text will change with different words forming the *HTTP* acronym.
We will use a script in **NodeJS** to retrieve the payload and to change the element in the static content with our datas. It will use the **JQuery** library.

## Changing the index.html in the static server
We started by changing the `index.html` file in our static server developped in step 1. First we have to identify the element we want to be refreshed with the dynamic content. To do s, we used the developper tools offere by **Google Chrome**.
![The element and it's id](images/element.png)

We found the id: `homeHeading`.

We now have to add our script into the `index.html` file. Our script is called `acronym.js` and is at the same level as `index.html`.

```
...

<!-- Generate the HTTP acronym -->
<script src="acronym.js"></script>
```

## Developping the script with JQuery
The puropse of the script is to retrieve the JSON from our dynamic server container and to change the element previously found.
To do so we use the **JQuery** library
