import { JSDOM } from 'jsdom';
import { testZBarInstance } from './instance.test';

let zbarWasm;

beforeAll(() => {
    return JSDOM.fromFile('test/instance-browser.test.html', {
        runScripts: 'dangerously',
        resources: 'usable'
    }).then(dom => {
        return new Promise<void>(resolve => { 
            // Wait until the HTML page has been loaded
            dom.window.addEventListener('load', ev => {
                zbarWasm = dom.window.zbarWasm;
                resolve();
            });
        });
    });
});


test('zbarWasm variable exists', () => {
    expect(typeof zbarWasm).toEqual('object');
    expect(typeof zbarWasm.getInstance).toEqual('function');
});


test('ZBarInstance created', async () => {
    const inst = await zbarWasm.getInstance();
    testZBarInstance(inst);
});
