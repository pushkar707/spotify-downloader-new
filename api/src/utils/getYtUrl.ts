import { Browser } from "puppeteer";

export default async (browser: Browser, track: any) => {
    if(track.ytVideoLink)
        return track.ytVideoLink
    const page = await browser.newPage();
    page.setDefaultTimeout(600000);
    await page.goto(`https://www.youtube.com/results?search_query=${track.name} ${track.artists.join(" ")}`);
    await page.waitForSelector('ytd-video-renderer a.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail');
    const content = await page.$eval('ytd-video-renderer a.yt-simple-endpoint.inline-block.style-scope.ytd-thumbnail', el => el.href);
    await page.close()
    track.ytVideoLink = content
    await track.save()
    return content
}