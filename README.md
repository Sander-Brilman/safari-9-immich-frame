# Safari 9 Immich Frame

**Warning! While this project is now fairly stable updates can still happen and breaking changes are not guarenteed not to happen. If you do want an extremely stable version then it is recommended to download the code and host it yourself to prevent unwanted automatic updates**  

Safari 9 Immich Frame is an photo frame for safari 9 using [Immich](https://immich.app/) as the photo backend. While it partially shares a name, this is not related to the [Immich Frame](https://immichframe.dev/) or the [Immich kiosk](https://demo.immichkiosk.app/) project, other then a shared love for Immich ofcourse!


## How to use

I have published the whole app on [github pages](https://sander-brilman.github.io/safari-9-immich-kiosk/). You can use it directly from here, dont need to host your own.

To use it you need to enter your immich server url and [api key](http://my.immich.app/user-settings?isOpen=api-keys). The api key needs the following rights:
- asset.read
- asset.view
- album.read

Since the app is completely client-side you need to make sure your immich server **responds with correct cors headers:**
```
Access-Control-Allow-Origin *
Access-Control-Allow-Methods *
Access-Control-Allow-Headers *
```

This is best done using an reverse proxy such as [caddy](https://caddyserver.com/), here is a quick example on how:

```
mydomain.org {
	reverse_proxy localhost:2283

	encode

	header {
		Access-Control-Allow-Origin *
		Access-Control-Allow-Methods *
		Access-Control-Allow-Headers *
	}
}
```

## Why did you build your own? Why not use Immich Frame or Immich kiosk?

This project is specifically written to use on an ipads running safari 9.3.5. Other projects do not support this legacy browser (fair enough!). So i figured why not do it myself. Also building something like this yourself is alot of fun!

## How did you manage to make it work on safari 9?

Good old [Jquery](https://jquery.com/) still supports safari 9 very well. Using jquery makes developing this alot easier compared to vanilla as it provides a lovely syntax for building a UI and works excellent.

## Can i import/export settings using JSON?

YES! 

In the settings page you can import settings from a json input by either directly pasting it in or fetching it from a url.
Here is an example of the expected input:
```json
{
    "zoomMultiplier": 1.25,
    "slideDuration": 10000,
    "animationSpeed": 1000,
    "immichApiKey": "xxx",
    "immichServerUrl": "https://demo.immich.app",
}
```


## I dont want to use the github pages, how do i self-host?

The whole app is located inside the `wwwroot` directory. It is all static files with no backend, compilation necessary.
If you want to host your own (modified) version all you need is a webserver serving everything inside `wwwroot` as a static asset.  

This can be any web server, i personally reccomend caddy.

## Are the any planned features:

A few, but the project is fairly done as-is. Maybe they will come in the future, maybe not ¯\_(ツ)_/¯

- [x] split view
- [ ] pauze and play button
- [ ] clock?


## What probably will not be included unless someone picks up the effort:

- Weather indicator for specified location
- Filters
- Multiple asset selection rules
