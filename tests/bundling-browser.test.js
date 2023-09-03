import { default as express } from 'express'
import { default as cors } from 'cors'
import { Selector } from 'testcafe'
import { buildConfigs } from '../build/buildConfigs.js'
import { webPort, repositoryPort } from './ports.js';

const expectedBarcode = 'Lorem-ipsum-12345'

const app = express()

app.use(cors())
app.use(express.static('./'))

buildConfigs
    .filter(c => c.indexHtml)
    .forEach(c => {
        let webServer, repoServer

        fixture(`Browser ${c.format} (zbar.wasm: ${c.asset}) built by ${c.bundler}`)
            .before(() => {
                repoServer = app.listen(repositoryPort)
                webServer = app.listen(webPort)
            })
            .page(`http://localhost:${webPort}/${c.relativeToProjectDir(c.indexPath)}`)
            .after(() => {
                webServer.close()
                repoServer.close()
            })

        test(`Barcode scanned`, async t => {
                await t.expect(Selector('pre').innerText).eql(expectedBarcode)
            }
        )
    })
