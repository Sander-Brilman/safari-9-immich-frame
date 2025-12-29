# Safari 9 Immich Frame

Safari 9 Immich Frame is an photo frame for safari 9 using [Immich](https://immich.app/) as the photo backend. While it partially shares a name, this is not related to the [Immich Frame](https://immichframe.dev/) or the [Immich kiosk](https://demo.immichkiosk.app/) project, other then a shared love for Immich ofcourse!

<hr>

## How to use

So the whole app is located inside the `wwwroot` directory. It is all static files with no backend, compilation or anything other then a basic webserver needed. Luckely, 

<hr>

## Why build your own? why not use Immich Frame or Immich kiosk?

This project is specifically written to use on an original ipad mini running safari 9.3.5. Other projects do not support this legacy browser (fair enough!). So i figured why not do it myself. Also building something like this yourself is alot of fun!

<hr>

## How do you manage to make it work on safari 9?

Good old [Jquery](https://jquery.com/) still supports safari 9 very well. Using jquery makes developing this alot easier as it provides a lovely syntax for building a UI and works excellent.

<hr>

## How do i import settings using JSON?

In the settings page you can import settings from a json input by either directly pasting it in or fetching it from a url.
Here is an example of the expected input:
```json
{
    "slideDuration": 15000,
    "animationSpeed": 1000,
    "immichApiKey": "xxx",
    "immichServerUrl": "https://demo.immich.app"
}
```