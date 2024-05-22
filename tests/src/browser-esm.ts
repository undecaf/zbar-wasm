import { scanImageData, setModuleArgs } from '@undecaf/zbar-wasm'

(async () => {
    const
        img: HTMLImageElement = document.querySelector('img') as HTMLImageElement,
        result = document.querySelector('pre'),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    await img.decode()
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    context!.drawImage(img, 0, 0)

    const
        imageData = context!.getImageData(0, 0, canvas.width, canvas.height),
        symbols = await scanImageData(imageData);

    result!.innerText = symbols.map(s => s.decode()).join(',')
    window.dispatchEvent(new Event('scanned'))
})()
