# Rhythm Proxy

## Getting Started

Rhythm Proxy can be used to make your Jenkin's radiator dance and play a song when all of the jobs go green.

It can be configured by changing the values in the `config.json`:

```json
{
    "jenkinsHost" : "jenkins-as01.gale.web:8080",
    "proxyPort" : "8000",
    "soundFileTypes" : [
        ".mp3"
    ],
    "soundFileDir" : "music"
}
```

## Options

- jenkinsHost [String]: URL that you view the radiator on
- proxyPort [String]: port that you want to host the proxy on
- soundFileTypes [Array of Strings]: file extension(s) that the server should scan for
- soundFileDir [String]: name of the directory that the sound files are in

## Usage

`npm install`

To start the server: `npm start`

To run in dev mode so that it runs despite some jobs not being green: `npm run dev`

## Example

![](sample.gif)

## License

Rhythm Proxy is licensed under the MIT License.

