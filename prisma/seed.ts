import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple hash matching the register route
function simpleHash(password: string): string {
  return Buffer.from(btoa(password)).toString('base64');
}

// All M3U channels data - parsed from user's M3U playlist
// Duplicates (same name, different URLs) are grouped together for multi-server support
interface M3UChannel {
  name: string;
  logo: string;
  category: string;
  streams: { url: string; label: string }[];
}

const ALL_CHANNELS: M3UChannel[] = [
  // ─── BANGLA ──────────────────────────────────────────────────────────────
  { name: 'BTV', logo: 'https://dl.dropbox.com/scl/fi/btv-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1709/output/index.m3u8', label: 'Server 1' },
    { url: 'https://tvsen7.aynaott.com/btv/backup/tracks-v1a1/mono.ts.m3u8', label: 'Server 2' },
  ]},
  { name: 'RTV Live', logo: 'https://dl.dropbox.com/scl/fi/rtv-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/rtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Channel I HD', logo: 'https://dl.dropbox.com/scl/fi/channel-i-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1723/output/1723-audio_113532_eng=113200-video=2202800.m3u8', label: 'Server 1' },
  ]},
  { name: 'Deepto TV', logo: 'https://dl.dropbox.com/scl/fi/deepto-logo.png', category: 'Bangla', streams: [
    { url: 'https://byphdgllyk.gpcdn.net/hls/deeptotv/0_1/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'NTV', logo: 'https://dl.dropbox.com/scl/fi/ntv-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1716/output/1716-audio_113462_eng=113200-video=1181200.m3u8', label: 'Server 1' },
  ]},
  { name: 'Channel9 HD', logo: 'https://dl.dropbox.com/scl/fi/channel9-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1729/output/1729-audio_113592_eng=113200-video=1181200.m3u8', label: 'Server 1' },
  ]},
  { name: 'Bangla Vision', logo: 'https://dl.dropbox.com/scl/fi/bangla-vision-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1715/output/1715-audio_113452_eng=113200-video=1181200.m3u8', label: 'Server 1' },
  ]},
  { name: 'Ekattor TV HD', logo: 'https://dl.dropbox.com/scl/fi/ekattor-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1705/output/1705.m3u8', label: 'Server 1' },
  ]},
  { name: 'Ekushe TV', logo: 'https://dl.dropbox.com/scl/fi/ekushe-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/etv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Maasranga TV', logo: 'https://dl.dropbox.com/scl/fi/maasranga-logo.png', category: 'Bangla', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1722/output/1722.m3u8', label: 'Server 1' },
  ]},
  { name: 'Channel S TV', logo: 'https://dl.dropbox.com/scl/fi/channel-s-logo.png', category: 'Bangla', streams: [
    { url: 'https://app.ncare.live/live-orgin/channels.stream/live-orgin/channels.stream/chunks.m3u8', label: 'Server 1' },
  ]},
  { name: 'Boishakhi TV', logo: 'https://dl.dropbox.com/scl/fi/boishakhi-logo.png', category: 'Bangla', streams: [
    { url: 'https://boishakhi.sonarbanglatv.com/boishakhi/boishakhitv/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'Mohona TV', logo: 'https://dl.dropbox.com/scl/fi/mohona-logo.png', category: 'Bangla', streams: [
    { url: 'https://app24.jagobd.com.bd/c3VydmVyX8RpbEU9Mi8xNy8yMFDEEHGcfRgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcEdsEfeDeKiNkVN3PTOmdFseWRtaW51aiPhnPTI2/mohonatv.stream/tracks-v1a1/mono.m3u8', label: 'Server 1' },
  ]},
  { name: 'Desh TV', logo: 'https://dl.dropbox.com/scl/fi/desh-tv-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/deshtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Bijoy TV', logo: 'https://dl.dropbox.com/scl/fi/bijoy-logo.png', category: 'Bangla', streams: [
    { url: 'https://stream.ottplus.live/live/bijoy_tv_abr/live/bijoy_tv_480/chunks.m3u8', label: 'Server 1' },
  ]},
  { name: 'Nexus TV', logo: 'https://dl.dropbox.com/scl/fi/nexus-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/nexustv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Global TV', logo: 'https://dl.dropbox.com/scl/fi/global-tv-logo.png', category: 'Bangla', streams: [
    { url: 'https://app24.jagobd.com.bd/c3VydmVyX8RpbEU9Mi8xNy8yMFDEEHGcfRgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcEdsEfeDeKiNkVN3PTOmdFseWRtaW51aiPhnPTI2/Global-tv.stream/tracks-v1a1/mono.m3u8', label: 'Server 1' },
  ]},
  { name: 'Star Jalsha', logo: 'https://dl.dropbox.com/scl/fi/star-jalsha-logo.png', category: 'Bangla', streams: [
    { url: 'https://tyr.zibobdixserver.top/hls/StarJalshaHD.m3u8', label: 'Server 1' },
  ]},
  { name: 'ATN Bangla', logo: 'https://dl.dropbox.com/scl/fi/atn-bangla-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/atnbangla/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Channel 1 TV', logo: 'https://dl.dropbox.com/scl/fi/channel-1-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/channel1/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Ayna TV', logo: 'https://dl.dropbox.com/scl/fi/ayna-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/aynatv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Asian TV', logo: 'https://dl.dropbox.com/scl/fi/asian-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/asiantv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'SA TV', logo: 'https://dl.dropbox.com/scl/fi/satv-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/satv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'DD Bangla', logo: 'https://dl.dropbox.com/scl/fi/dd-bangla-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/ddbangla/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'My TV', logo: 'https://dl.dropbox.com/scl/fi/my-tv-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/mytv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Ananda TV', logo: 'https://dl.dropbox.com/scl/fi/ananda-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/anandatv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'R Plus', logo: 'https://dl.dropbox.com/scl/fi/rplus-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/rplus/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Enter 10 Bangla', logo: 'https://dl.dropbox.com/scl/fi/enter10-logo.png', category: 'Bangla', streams: [
    { url: 'https://tvsen6.aynaott.com/enter10bangla/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── NEWS ────────────────────────────────────────────────────────────────
  { name: 'Star News', logo: 'https://dl.dropbox.com/scl/fi/star-news-logo.png', category: 'News', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1710/output/1710-audio_113402_eng=113200-video=1181200.m3u8', label: 'Server 1' },
  ]},
  { name: 'Jago News 24', logo: 'https://dl.dropbox.com/scl/fi/jago-news-logo.png', category: 'News', streams: [
    { url: 'https://app.ncare.live/live-orgin/jagonews24.stream/live-orgin/jagonews24.stream/chunks.m3u8', label: 'Server 1' },
  ]},
  { name: 'Jamuna TV', logo: 'https://dl.dropbox.com/scl/fi/jamuna-logo.png', category: 'News', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1728/output/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'DBC News', logo: 'https://dl.dropbox.com/scl/fi/dbc-logo.png', category: 'News', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1727/output/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'Ekhon TV', logo: 'https://dl.dropbox.com/scl/fi/ekhon-logo.png', category: 'News', streams: [
    { url: 'https://tvsen6.aynaott.com/ekhontv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'News 24', logo: 'https://dl.dropbox.com/scl/fi/news24-logo.png', category: 'News', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1708/output/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'Somoy TV', logo: 'https://dl.dropbox.com/scl/fi/somoy-logo.png', category: 'News', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1702/output/index.m3u8', label: 'Server 1' },
    { url: 'https://tvsen5.aynaott.com/somoytv/backup/tracks-v1a1/mono.ts.m3u8', label: 'Server 2' },
  ]},
  { name: 'Channel 24', logo: 'https://dl.dropbox.com/scl/fi/channel-24-logo.png', category: 'News', streams: [
    { url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1703/output/1703-audio_113332_eng=113200-video=2202800.m3u8', label: 'Server 1' },
  ]},
  { name: 'Independent TV', logo: 'https://dl.dropbox.com/scl/fi/independent-logo.png', category: 'News', streams: [
    { url: 'https://tvsen6.aynaott.com/independenttv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'ATN News HD', logo: 'https://dl.dropbox.com/scl/fi/atn-news-logo.png', category: 'News', streams: [
    { url: 'https://tvsen6.aynaott.com/atnnews/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'CNN Now', logo: 'https://dl.dropbox.com/scl/fi/cnn-logo.png', category: 'News', streams: [
    { url: 'https://amg01448-samsungin-cnnnow-samsungin-4npqg.amagi.tv/playlist/amg01448-samsungin-cnnnow-samsungin/playlist.m3u8', label: 'Server 1' },
  ]},
  { name: 'Al Jazeera English', logo: 'https://dl.dropbox.com/scl/fi/aljazeera-logo.png', category: 'News', streams: [
    { url: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8', label: 'Server 1' },
  ]},
  { name: 'TRT World', logo: 'https://dl.dropbox.com/scl/fi/trt-world-logo.png', category: 'News', streams: [
    { url: 'https://tv-trtworld.live.trt.com.tr/master.m3u8', label: 'Server 1' },
  ]},
  { name: 'France 24 English', logo: 'https://dl.dropbox.com/scl/fi/france24-logo.png', category: 'News', streams: [
    { url: 'https://stream.france24.com/F24_EN_HI_HLS/live_web.m3u8', label: 'Server 1' },
  ]},
  { name: 'DW News', logo: 'https://dl.dropbox.com/scl/fi/dw-news-logo.png', category: 'News', streams: [
    { url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'Sky News', logo: 'https://dl.dropbox.com/scl/fi/sky-news-logo.png', category: 'News', streams: [
    { url: 'https://linear-153.frequency.stream/dist/localnow/153/hls/master/playlist.m3u8', label: 'Server 1' },
  ]},
  { name: 'NHK World Japan', logo: 'https://dl.dropbox.com/scl/fi/nhk-logo.png', category: 'News', streams: [
    { url: 'https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/domestic/263942/live_wa_s.m3u8', label: 'Server 1' },
  ]},
  { name: 'CGTN', logo: 'https://dl.dropbox.com/scl/fi/cgtn-logo.png', category: 'News', streams: [
    { url: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8', label: 'Server 1' },
  ]},
  { name: 'RT News', logo: 'https://dl.dropbox.com/scl/fi/rt-news-logo.png', category: 'News', streams: [
    { url: 'https://rt-glb.rttv.com/live/rtnews/playlist.m3u8', label: 'Server 1' },
  ]},
  { name: 'India Today', logo: 'https://dl.dropbox.com/scl/fi/india-today-logo.png', category: 'News', streams: [
    { url: 'https://indiatoday.akamaized.net/hls/live/2014728/indiatodaytv/indiatodaytv_high/master.m3u8', label: 'Server 1' },
  ]},
  { name: 'TV9 Bangla', logo: 'https://dl.dropbox.com/scl/fi/tv9-bangla-logo.png', category: 'News', streams: [
    { url: 'https://tv9bangla.akamaized.net/hls/live/2107528/tv9bangla/master.m3u8', label: 'Server 1' },
  ]},
  { name: 'Kolkata TV', logo: 'https://dl.dropbox.com/scl/fi/kolkata-tv-logo.png', category: 'News', streams: [
    { url: 'https://kolkatatv.akamaized.net/hls/live/2104340/kolkatatv/master.m3u8', label: 'Server 1' },
  ]},
  { name: 'Bloomberg TV', logo: 'https://dl.dropbox.com/scl/fi/bloomberg-logo.png', category: 'News', streams: [
    { url: 'https://liveproduseast.akamaized.net/btv/desktop/akamai/europe/live/primary.m3u8', label: 'Server 1' },
  ]},

  // ─── SPORTS ─────────────────────────────────────────────────────────────
  { name: 'FIFA Plus', logo: 'https://dl.dropbox.com/scl/fi/fifa-logo.png', category: 'Sports', streams: [
    { url: 'https://37b4c228.wurl.com/manifest/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWZyX0ZJRkFQbHVzRnJlbmNoX0hMUw/6f5437c5-e015-4754-8476-c8c6d27d3a55/1.m3u8', label: 'Server 1' },
  ]},
  { name: 'Willow TV', logo: 'https://dl.dropbox.com/scl/fi/willow-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen5.aynaott.com/willowhd/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'T Sports HD', logo: 'https://dl.dropbox.com/scl/fi/tsports-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen7.aynaott.com/tsports-hd/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
    { url: 'https://tvsen5.aynaott.com/tsports/backup/tracks-v1a1/mono.ts.m3u8', label: 'Server 2' },
  ]},
  { name: 'Goal TV HD', logo: 'https://dl.dropbox.com/scl/fi/goal-tv-logo.png', category: 'Sports', streams: [
    { url: 'https://streams2.sofast.tv/sofast/goaltv/goaltv_3500k.m3u8', label: 'Server 1' },
  ]},
  { name: 'ASports HD', logo: 'https://dl.dropbox.com/scl/fi/asports-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen6.aynaott.com/asports/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Sports Grid', logo: 'https://dl.dropbox.com/scl/fi/sports-grid-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen6.aynaott.com/SportsGrid/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Star Sports 1 HD', logo: 'https://dl.dropbox.com/scl/fi/star-sports-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen7.aynaott.com/sspts1/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Gazi TV', logo: 'https://dl.dropbox.com/scl/fi/gtv-logo.png', category: 'Sports', streams: [
    { url: 'https://app24.jagobd.com.bd/c3VydmVyX8RpbEU9Mi8xNy8yMFDEEHGcfRgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcEdsEfeDeKiNkVN3PTOmdFseWRtaW51aiPhnPTI2/gazibdz.stream/tracks-v1a1/mono.m3u8', label: 'Server 1' },
    { url: 'https://tvsen5.aynaott.com/gtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 2' },
    { url: 'https://tvsen7.aynaott.com/gazitv/backup/tracks-v1a1/mono.ts.m3u8', label: 'Server 3' },
  ]},
  { name: 'Football World Cup 2026', logo: 'https://dl.dropbox.com/scl/fi/football-wc-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen7.aynaott.com/fifawc2026/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Live Sports', logo: 'https://dl.dropbox.com/scl/fi/live-sports-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen6.aynaott.com/livesports/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'PTV Sports', logo: 'https://dl.dropbox.com/scl/fi/ptv-sports-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen6.aynaott.com/ptvsports/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Cricket Gold', logo: 'https://dl.dropbox.com/scl/fi/cricket-gold-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen7.aynaott.com/cricketgold/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'ESPN', logo: 'https://dl.dropbox.com/scl/fi/espn-logo.png', category: 'Sports', streams: [
    { url: 'https://tvsen5.aynaott.com/espn/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── KIDS ────────────────────────────────────────────────────────────────
  { name: 'Tom & Jerry TV', logo: 'https://dl.dropbox.com/scl/fi/tom-jerry-logo.png', category: 'Kids', streams: [
    { url: 'https://live20.bozztv.com/giatvplayout7/giatv-208314/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Doraemon TV', logo: 'https://dl.dropbox.com/scl/fi/doraemon-logo.png', category: 'Kids', streams: [
    { url: 'https://live20.bozztv.com/giatvplayout7/giatv-209902/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Mr Bean Animated', logo: 'https://dl.dropbox.com/scl/fi/mr-bean-logo.png', category: 'Kids', streams: [
    { url: 'https://amg00627-amg00627c29-rakuten-it-3989.playouts.now.amagi.tv/playlist/amg00627-banijayfast-mrbeanitcc-rakutenit/playlist.m3u8', label: 'Server 1' },
  ]},
  { name: 'Cartoon Network', logo: 'https://dl.dropbox.com/scl/fi/cartoon-network-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen5.aynaott.com/cartoonnetwork/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Gopal Bhar TV', logo: 'https://dl.dropbox.com/scl/fi/gopal-bhar-logo.png', category: 'Kids', streams: [
    { url: 'https://live20.bozztv.com/giatvplayout7/giatv-209611/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Nickelodeon', logo: 'https://dl.dropbox.com/scl/fi/nickelodeon-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen6.aynaott.com/nickelodeon/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Disney Channel', logo: 'https://dl.dropbox.com/scl/fi/disney-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen7.aynaott.com/disneychannel/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Duronto TV', logo: 'https://dl.dropbox.com/scl/fi/duronto-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen6.aynaott.com/duronto/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Disney JR', logo: 'https://dl.dropbox.com/scl/fi/disney-jr-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen5.aynaott.com/disneyjr/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Nicktoons', logo: 'https://dl.dropbox.com/scl/fi/nicktoons-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen6.aynaott.com/nicktoons/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Nickjr', logo: 'https://dl.dropbox.com/scl/fi/nickjr-logo.png', category: 'Kids', streams: [
    { url: 'https://tvsen7.aynaott.com/nickjr/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── ENGLISH ─────────────────────────────────────────────────────────────
  { name: 'DW English HD', logo: 'https://dl.dropbox.com/scl/fi/dw-english-logo.png', category: 'English', streams: [
    { url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', label: 'Server 1' },
  ]},
  { name: 'ABP Ananda', logo: 'https://dl.dropbox.com/scl/fi/abp-ananda-logo.png', category: 'English', streams: [
    { url: 'https://amg01448-samsungin-abpananda-samsungin-4npqg.amagi.tv/playlist/amg01448-samsungin-abpananda-samsungin/playlist.m3u8', label: 'Server 1' },
  ]},
  { name: 'HBO', logo: 'https://dl.dropbox.com/scl/fi/hbo-logo.png', category: 'English', streams: [
    { url: 'https://tvsen5.aynaott.com/hbo/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Nat Geo TV', logo: 'https://dl.dropbox.com/scl/fi/nat-geo-logo.png', category: 'English', streams: [
    { url: 'https://tvsen6.aynaott.com/natgeo/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Discovery Family', logo: 'https://dl.dropbox.com/scl/fi/discovery-logo.png', category: 'English', streams: [
    { url: 'https://tvsen7.aynaott.com/discoveryfamily/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Animal Planet', logo: 'https://dl.dropbox.com/scl/fi/animal-planet-logo.png', category: 'English', streams: [
    { url: 'https://tvsen5.aynaott.com/animalplanet/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'BBC Earth', logo: 'https://dl.dropbox.com/scl/fi/bbc-earth-logo.png', category: 'English', streams: [
    { url: 'https://tvsen6.aynaott.com/bbcearth/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Star Movies', logo: 'https://dl.dropbox.com/scl/fi/star-movies-logo.png', category: 'English', streams: [
    { url: 'https://tvsen7.aynaott.com/starmovies/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── INDIAN ──────────────────────────────────────────────────────────────
  { name: 'Sony TV', logo: 'https://dl.dropbox.com/scl/fi/sony-tv-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen5.aynaott.com/sonytv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Sony SAB', logo: 'https://dl.dropbox.com/scl/fi/sony-sab-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen6.aynaott.com/sonysab/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Colors HD', logo: 'https://dl.dropbox.com/scl/fi/colors-hd-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen7.aynaott.com/colorshd/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Zee TV', logo: 'https://dl.dropbox.com/scl/fi/zee-tv-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen5.aynaott.com/zeetv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Star Plus', logo: 'https://dl.dropbox.com/scl/fi/star-plus-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen6.aynaott.com/starplus/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'And TV', logo: 'https://dl.dropbox.com/scl/fi/and-tv-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen7.aynaott.com/andtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Zee Bangla', logo: 'https://dl.dropbox.com/scl/fi/zee-bangla-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen5.aynaott.com/zeebangla/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Colors Bangla', logo: 'https://dl.dropbox.com/scl/fi/colors-bangla-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen6.aynaott.com/colorsbangla/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Sony Aath', logo: 'https://dl.dropbox.com/scl/fi/sony-aath-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen7.aynaott.com/sonyaath/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: '9XM', logo: 'https://dl.dropbox.com/scl/fi/9xm-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen5.aynaott.com/9xm/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: '9x Jalwa', logo: 'https://dl.dropbox.com/scl/fi/9x-jalwa-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen6.aynaott.com/9xjalwa/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: '8XM', logo: 'https://dl.dropbox.com/scl/fi/8xm-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen7.aynaott.com/8xm/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'B4U Music', logo: 'https://dl.dropbox.com/scl/fi/b4u-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen5.aynaott.com/b4umusic/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Music India', logo: 'https://dl.dropbox.com/scl/fi/music-india-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen6.aynaott.com/musicindia/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Manoranjan TV', logo: 'https://dl.dropbox.com/scl/fi/manoranjan-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen7.aynaott.com/manoranjan/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'ShemarooTV', logo: 'https://dl.dropbox.com/scl/fi/shemaroo-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen5.aynaott.com/shemaroo/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Goldmines Bollywood', logo: 'https://dl.dropbox.com/scl/fi/goldmines-logo.png', category: 'Indian', streams: [
    { url: 'https://tvsen6.aynaott.com/goldmines/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── MOVIE ───────────────────────────────────────────────────────────────
  { name: 'Sony Max', logo: 'https://dl.dropbox.com/scl/fi/sony-max-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen7.aynaott.com/sonymax/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Zee Cinema', logo: 'https://dl.dropbox.com/scl/fi/zee-cinema-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen5.aynaott.com/zeecinema/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'MovieSphere', logo: 'https://dl.dropbox.com/scl/fi/moviesphere-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen6.aynaott.com/moviesphere/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Action Hollywood Movies', logo: 'https://dl.dropbox.com/scl/fi/action-hollywood-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen7.aynaott.com/actionhollywood/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Rakuten Movies', logo: 'https://dl.dropbox.com/scl/fi/rakuten-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen5.aynaott.com/rakutenmovies/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'HBO 2', logo: 'https://dl.dropbox.com/scl/fi/hbo2-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen6.aynaott.com/hbo2/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'COMEDY CENTRAL', logo: 'https://dl.dropbox.com/scl/fi/comedy-central-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen7.aynaott.com/comedycentral/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'SYFY TV', logo: 'https://dl.dropbox.com/scl/fi/syfy-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen5.aynaott.com/syfy/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Sony Pal', logo: 'https://dl.dropbox.com/scl/fi/sony-pal-logo.png', category: 'Movie', streams: [
    { url: 'https://tvsen6.aynaott.com/sonypal/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── MUSIC ───────────────────────────────────────────────────────────────
  { name: 'MTV', logo: 'https://dl.dropbox.com/scl/fi/mtv-logo.png', category: 'Music', streams: [
    { url: 'https://tvsen7.aynaott.com/mtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'VH1', logo: 'https://dl.dropbox.com/scl/fi/vh1-logo.png', category: 'Music', streams: [
    { url: 'https://tvsen5.aynaott.com/vh1/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Sangeet Bangla', logo: 'https://dl.dropbox.com/scl/fi/sangeet-bangla-logo.png', category: 'Music', streams: [
    { url: 'https://tvsen6.aynaott.com/sangeetbangla/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'YRF Music', logo: 'https://dl.dropbox.com/scl/fi/yrf-logo.png', category: 'Music', streams: [
    { url: 'https://tvsen7.aynaott.com/yrf/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Party Universe', logo: 'https://dl.dropbox.com/scl/fi/party-universe-logo.png', category: 'Music', streams: [
    { url: 'https://tvsen5.aynaott.com/partyuniverse/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Show Box', logo: 'https://dl.dropbox.com/scl/fi/show-box-logo.png', category: 'Music', streams: [
    { url: 'https://tvsen6.aynaott.com/showbox/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── RELIGIOUS ───────────────────────────────────────────────────────────
  { name: 'Peace TV', logo: 'https://dl.dropbox.com/scl/fi/peace-tv-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen7.aynaott.com/peacetv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'MADANI TV', logo: 'https://dl.dropbox.com/scl/fi/madani-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen5.aynaott.com/madani/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Makkah TV', logo: 'https://dl.dropbox.com/scl/fi/makkah-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen6.aynaott.com/makkah/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'EWTN', logo: 'https://dl.dropbox.com/scl/fi/ewtn-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen7.aynaott.com/ewtn/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'God TV', logo: 'https://dl.dropbox.com/scl/fi/god-tv-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen5.aynaott.com/godtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Al Quran TV', logo: 'https://dl.dropbox.com/scl/fi/quran-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen6.aynaott.com/alquran/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Islamic TV', logo: 'https://dl.dropbox.com/scl/fi/islamic-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen7.aynaott.com/islamictv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Deen TV', logo: 'https://dl.dropbox.com/scl/fi/deen-tv-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen5.aynaott.com/deentv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Eman Channel', logo: 'https://dl.dropbox.com/scl/fi/eman-logo.png', category: 'Religious', streams: [
    { url: 'https://tvsen6.aynaott.com/emanchannel/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},

  // ─── DOCUMENTARY ─────────────────────────────────────────────────────────
  { name: 'CGTN Documentary', logo: 'https://dl.dropbox.com/scl/fi/cgtn-doc-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen7.aynaott.com/cgtndoc/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Discovery Science', logo: 'https://dl.dropbox.com/scl/fi/discovery-science-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen5.aynaott.com/discoveryscience/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Travel XP', logo: 'https://dl.dropbox.com/scl/fi/travel-xp-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen6.aynaott.com/travelxp/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Wild TV', logo: 'https://dl.dropbox.com/scl/fi/wild-tv-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen7.aynaott.com/wildtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Discover Pakistan', logo: 'https://dl.dropbox.com/scl/fi/discover-pakistan-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen5.aynaott.com/discoverpakistan/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'AccuWeather', logo: 'https://dl.dropbox.com/scl/fi/accuweather-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen6.aynaott.com/accuweather/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'History TV', logo: 'https://dl.dropbox.com/scl/fi/history-tv-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen7.aynaott.com/historytv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'Food Network', logo: 'https://dl.dropbox.com/scl/fi/food-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen5.aynaott.com/foodnetwork/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'HGTV', logo: 'https://dl.dropbox.com/scl/fi/hgtv-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen6.aynaott.com/hgtv/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
  { name: 'TLC HD', logo: 'https://dl.dropbox.com/scl/fi/tlc-logo.png', category: 'Documentary', streams: [
    { url: 'https://tvsen7.aynaott.com/tlchd/tracks-v1a1/mono.ts.m3u8', label: 'Server 1' },
  ]},
];

// Featured and trending channel names
const FEATURED_NAMES = ['BTV', 'Somoy TV', 'T Sports HD', 'Star Sports 1 HD', 'FIFA Plus', 'Channel 24', 'Gazi TV'];
const TRENDING_NAMES = ['FIFA Plus', 'T Sports HD', 'Cartoon Network', 'Gazi TV', 'Channel 24', 'Mr Bean Animated', 'ESPN', 'BTV', 'Somoy TV'];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@firalive.com' },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@firalive.com',
        password: simpleHash('admin123'),
        role: 'admin',
        isVerified: true,
        isBanned: false,
      },
    });
    console.log('✅ Admin user created (admin@firalive.com / admin123)');
  } else {
    console.log('ℹ️  Admin user already exists, skipping');
  }

  // 2. Seed channels with multi-server support
  const existingChannels = await prisma.channel.findMany({
    select: { id: true, name: true, streamUrl: true, logo: true },
  });

  // Build lookup by name for updating existing channels
  const existingByName = new Map<string, typeof existingChannels[0]>();
  for (const ch of existingChannels) {
    existingByName.set(ch.name, ch);
  }

  let channelsCreated = 0;
  let channelsUpdated = 0;
  let serversCreated = 0;

  for (const m3uCh of ALL_CHANNELS) {
    const isFeatured = FEATURED_NAMES.includes(m3uCh.name);
    const isTrending = TRENDING_NAMES.includes(m3uCh.name);
    const primaryStream = m3uCh.streams[0];
    const backupStreams = m3uCh.streams.slice(1);

    const existing = existingByName.get(m3uCh.name);

    if (existing) {
      // Update existing channel with logo if missing, and update stream URL
      const updateData: Record<string, unknown> = {};
      if (!existing.logo && m3uCh.logo) {
        updateData.logo = m3uCh.logo;
      }
      // Always update the stream URL to the latest from M3U
      updateData.streamUrl = primaryStream.url;
      if (backupStreams.length > 0) {
        updateData.backupUrls = JSON.stringify(backupStreams.map(s => s.url));
      }

      await prisma.channel.update({
        where: { id: existing.id },
        data: updateData,
      });
      channelsUpdated++;

      // Now create ChannelServer entries for ALL streams of this channel
      // First, delete existing servers for this channel to avoid duplicates
      await prisma.channelServer.deleteMany({ where: { channelId: existing.id } });

      for (let i = 0; i < m3uCh.streams.length; i++) {
        const stream = m3uCh.streams[i];
        await prisma.channelServer.create({
          data: {
            channelId: existing.id,
            name: stream.label,
            streamUrl: stream.url,
            quality: i === 0 ? 'HD' : (i === 1 ? 'FHD' : 'SD'),
            isActive: true,
            order: i + 1,
          },
        });
        serversCreated++;
      }
    } else {
      // Create new channel
      const channel = await prisma.channel.create({
        data: {
          name: m3uCh.name,
          logo: m3uCh.logo || null,
          category: m3uCh.category,
          streamUrl: primaryStream.url,
          backupUrls: backupStreams.length > 0 ? JSON.stringify(backupStreams.map(s => s.url)) : null,
          featured: isFeatured,
          trending: isTrending,
          isLive: true,
          enabled: true,
          views: Math.floor(Math.random() * 5000) + 200,
        },
      });
      channelsCreated++;

      // Create ChannelServer entries for all streams
      for (let i = 0; i < m3uCh.streams.length; i++) {
        const stream = m3uCh.streams[i];
        await prisma.channelServer.create({
          data: {
            channelId: channel.id,
            name: stream.label,
            streamUrl: stream.url,
            quality: i === 0 ? 'HD' : (i === 1 ? 'FHD' : 'SD'),
            isActive: true,
            order: i + 1,
          },
        });
        serversCreated++;
      }
    }
  }

  console.log(`✅ Channels: ${channelsCreated} created, ${channelsUpdated} updated`);
  console.log(`✅ Channel Servers: ${serversCreated} created`);

  // 3. Create sample sports matches
  const existingMatches = await prisma.sportsMatch.count();
  let match1Id: string | null = null;
  let match2Id: string | null = null;

  if (existingMatches === 0) {
    const match1 = await prisma.sportsMatch.create({
      data: {
        team1: 'Bangladesh',
        team2: 'India',
        tournament: 'ICC Champions Trophy 2026',
        matchTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        team1Logo: 'https://flagcdn.com/w40/bd.png',
        team2Logo: 'https://flagcdn.com/w40/in.png',
        status: 'live',
        sport: 'cricket',
      },
    });
    match1Id = match1.id;

    const match2 = await prisma.sportsMatch.create({
      data: {
        team1: 'Brazil',
        team2: 'Argentina',
        tournament: 'FIFA World Cup Qualifiers',
        matchTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        team1Logo: 'https://flagcdn.com/w40/br.png',
        team2Logo: 'https://flagcdn.com/w40/ar.png',
        status: 'live',
        sport: 'football',
      },
    });
    match2Id = match2.id;

    await prisma.sportsMatch.createMany({
      data: [
        {
          team1: 'England',
          team2: 'Australia',
          tournament: 'The Ashes 2026',
          matchTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          team1Logo: 'https://flagcdn.com/w40/gb.png',
          team2Logo: 'https://flagcdn.com/w40/au.png',
          status: 'upcoming',
          sport: 'cricket',
        },
        {
          team1: 'Real Madrid',
          team2: 'Barcelona',
          tournament: 'La Liga 2026',
          matchTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          sport: 'football',
        },
      ],
    });
    console.log('✅ Sample sports matches created');
  } else {
    console.log('ℹ️  Sports matches already exist, skipping');
    const existingMatchesList = await prisma.sportsMatch.findMany({ select: { id: true, status: true } });
    const liveMatch = existingMatchesList.find(m => m.status === 'live');
    if (liveMatch) match1Id = liveMatch.id;
    if (existingMatchesList[0]) match2Id = existingMatchesList[0].id;
  }

  // 3b. Create sample sports servers for live matches
  const existingServers = await prisma.sportsServer.count();
  if (existingServers === 0 && match1Id) {
    await prisma.sportsServer.createMany({
      data: [
        {
          matchId: match1Id,
          name: 'Server 1 - HD',
          streamUrl: 'https://tvsen7.aynaott.com/tsports-hd/tracks-v1a1/mono.ts.m3u8',
          quality: 'HD',
          isActive: true,
          order: 1,
        },
        {
          matchId: match1Id,
          name: 'Server 2 - FHD',
          streamUrl: 'https://tvsen5.aynaott.com/willowhd/tracks-v1a1/mono.ts.m3u8',
          quality: 'FHD',
          isActive: true,
          order: 2,
        },
        {
          matchId: match1Id,
          name: 'Server 3 - SD',
          streamUrl: 'https://tvsen6.aynaott.com/asports/tracks-v1a1/mono.ts.m3u8',
          quality: 'SD',
          isActive: true,
          order: 3,
        },
      ],
    });
    console.log('✅ Sample sports servers created for live match');
  }

  if (existingServers === 0 && match2Id) {
    await prisma.sportsServer.createMany({
      data: [
        {
          matchId: match2Id,
          name: 'Server 1 - HD',
          streamUrl: 'https://37b4c228.wurl.com/manifest/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWZyX0ZJRkFQbHVzRnJlbmNoX0hMUw/6f5437c5-e015-4754-8476-c8c6d27d3a55/1.m3u8',
          quality: 'HD',
          isActive: true,
          order: 1,
        },
        {
          matchId: match2Id,
          name: 'Server 2 - FHD',
          streamUrl: 'https://tvsen6.aynaott.com/SportsGrid/tracks-v1a1/mono.ts.m3u8',
          quality: 'FHD',
          isActive: true,
          order: 2,
        },
      ],
    });
    console.log('✅ Sample sports servers created for football match');
  }

  // 4. Create sample donation methods
  const existingDonations = await prisma.donation.count();
  if (existingDonations === 0) {
    await prisma.donation.createMany({
      data: [
        {
          method: 'bkash',
          accountName: 'FiraLive TV',
          accountNumber: '01712345678',
          message: 'Please send bKash payment to support FiraLive TV',
          isActive: true,
        },
        {
          method: 'nagad',
          accountName: 'FiraLive TV',
          accountNumber: '01812345678',
          message: 'Please send Nagad payment to support FiraLive TV',
          isActive: true,
        },
        {
          method: 'rocket',
          accountName: 'FiraLive TV',
          accountNumber: '01912345678',
          message: 'Please send Rocket payment to support FiraLive TV',
          isActive: true,
        },
        {
          method: 'bank',
          accountName: 'FiraLive TV Ltd.',
          accountNumber: 'ACC-2024-1234567',
          message: 'Bank transfer details for FiraLive TV donations',
          isActive: true,
        },
      ],
    });
    console.log('✅ Sample donation methods created');
  } else {
    console.log('ℹ️  Donations already exist, skipping');
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
