import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CodeBlock } from "@/components/CodeBlock";
import { API_BASE, TEST_API_KEY } from "@/data/endpoints";
import { KeyRound, Zap, Bot, Code2, Terminal, Music, Video } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Popkid API" },
      { name: "description", content: "Use Popkid API in JavaScript, Python, cURL, PHP, and bots (WhatsApp / Telegram / Discord). Free apikey: popkid." },
    ],
  }),
  component: Docs,
});

function Docs() {
  const fetchEx = `// Vanilla fetch (browser or Node 18+)
const url = '${API_BASE}/api/ai/ai?apikey=${TEST_API_KEY}&q=Hello';
const res = await fetch(url);
const data = await res.json();
console.log(data.result);`;

  const axiosEx = `// Node.js with axios
const axios = require('axios');

async function chat(prompt) {
  const { data } = await axios.get('${API_BASE}/api/ai/ai', {
    params: { apikey: '${TEST_API_KEY}', q: prompt }
  });
  return data.result;
}

chat('Tell me a joke').then(console.log);`;

  const pythonEx = `# Python with requests
import requests

resp = requests.get(
    '${API_BASE}/api/ai/ai',
    params={'apikey': '${TEST_API_KEY}', 'q': 'Hello'}
)
print(resp.json())`;

  const curlEx = `curl "${API_BASE}/api/ai/ai?apikey=${TEST_API_KEY}&q=Hello"`;

  const phpEx = `<?php
$url = "${API_BASE}/api/ai/ai?apikey=${TEST_API_KEY}&q=Hello";
$response = file_get_contents($url);
$data = json_decode($response, true);
echo $data['result'];
?>`;

  const waBotEx = `// WhatsApp Bot (Baileys) — !ytmp3 <url>
const axios = require('axios');

async function handleCommand(sock, msg, command, args) {
  if (command === 'ytmp3') {
    const url = args[0];
    const { data } = await axios.get('${API_BASE}/api/download/ytmp3', {
      params: { apikey: '${TEST_API_KEY}', url }
    });
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: data.result.download_url },
      mimetype: 'audio/mp4'
    });
  }
}`;

  const tgBotEx = `// Telegram Bot (node-telegram-bot-api)
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\\/tiktok (.+)/, async (msg, match) => {
  const url = match[1];
  const { data } = await axios.get('${API_BASE}/api/download/tiktok', {
    params: { apikey: '${TEST_API_KEY}', url }
  });
  bot.sendVideo(msg.chat.id, data.result.video);
});`;

  const dcBotEx = `// Discord.js v14
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
  if (msg.content.startsWith('!ai ')) {
    const q = msg.content.slice(4);
    const { data } = await axios.get('${API_BASE}/api/ai/ai', {
      params: { apikey: '${TEST_API_KEY}', q }
    });
    msg.reply(data.result);
  }
});

client.login(process.env.DISCORD_TOKEN);`;

  const mp3Ex = `// MP3 Downloader — YouTube → MP3
const axios = require('axios');
const fs = require('fs');

async function downloadMp3(youtubeUrl, outputPath) {
  const { data } = await axios.get('${API_BASE}/api/download/ytmp3', {
    params: { apikey: '${TEST_API_KEY}', url: youtubeUrl }
  });
  const audio = await axios.get(data.result.download_url, { responseType: 'stream' });
  audio.data.pipe(fs.createWriteStream(outputPath));
}

downloadMp3('https://youtu.be/dQw4w9WgXcQ', './song.mp3');`;

  const mp4Ex = `// MP4 Downloader — YouTube → MP4
const axios = require('axios');
const fs = require('fs');

async function downloadMp4(youtubeUrl, outputPath) {
  const { data } = await axios.get('${API_BASE}/api/download/ytmp4', {
    params: { apikey: '${TEST_API_KEY}', url: youtubeUrl }
  });
  const video = await axios.get(data.result.download_url, { responseType: 'stream' });
  video.data.pipe(fs.createWriteStream(outputPath));
}

downloadMp4('https://youtu.be/dQw4w9WgXcQ', './video.mp4');`;

  return (
    <AppLayout>
      <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold mb-3 gradient-text">Documentation</h1>
          <p className="text-muted-foreground max-w-2xl">
            Everything you need to use Popkid API in your apps, scripts, and bots.
            All endpoints work with the free test key <code className="text-primary font-mono">popkid</code>.
          </p>
        </header>

        <Section icon={KeyRound} title="Authentication" subtitle="Pass your apikey as a query parameter on every request.">
          <div className="rounded-xl p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30">
            <div className="text-xs font-mono text-muted-foreground mb-2">FREE TEST API KEY</div>
            <div className="text-2xl font-mono font-bold text-primary mb-3">popkid</div>
            <p className="text-sm text-muted-foreground">
              Use this key forever, on every endpoint, no limits for personal projects.
            </p>
          </div>
        </Section>

        <Section icon={Zap} title="Base URL">
          <CodeBlock code={API_BASE} language="url" />
        </Section>

        <Section icon={Code2} title="JavaScript" subtitle="Use the API from any JS environment — browser, Node, Bun, Deno.">
          <Tabs
            tabs={[
              { label: "fetch", code: fetchEx, lang: "javascript" },
              { label: "axios", code: axiosEx, lang: "javascript" },
            ]}
          />
        </Section>

        <Section icon={Terminal} title="Other Languages">
          <Tabs
            tabs={[
              { label: "Python", code: pythonEx, lang: "python" },
              { label: "cURL", code: curlEx, lang: "bash" },
              { label: "PHP", code: phpEx, lang: "php" },
            ]}
          />
        </Section>

        <Section icon={Music} title="MP3 Downloader" subtitle="YouTube → MP3 audio file, ready to stream or save.">
          <CodeBlock code={mp3Ex} language="javascript" />
        </Section>

        <Section icon={Video} title="MP4 Downloader" subtitle="YouTube → MP4 video file in HD quality.">
          <CodeBlock code={mp4Ex} language="javascript" />
        </Section>

        <Section icon={Bot} title="Use in Bots — Everywhere" subtitle="Plug Popkid API into your WhatsApp, Telegram, or Discord bot.">
          <Tabs
            tabs={[
              { label: "WhatsApp (Baileys)", code: waBotEx, lang: "javascript" },
              { label: "Telegram", code: tgBotEx, lang: "javascript" },
              { label: "Discord.js", code: dcBotEx, lang: "javascript" },
            ]}
          />
        </Section>
      </div>
    </AppLayout>
  );
}

function Section({
  icon: Icon, title, subtitle, children,
}: { icon: typeof KeyRound; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-1">
          <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center border border-primary/30">
            <Icon className="h-4 w-4 text-primary" />
          </span>
          {title}
        </h2>
        {subtitle && <p className="text-muted-foreground text-sm ml-12">{subtitle}</p>}
      </div>
      <div className="ml-0 lg:ml-12">{children}</div>
    </section>
  );
}

import { useState } from "react";
function Tabs({ tabs }: { tabs: { label: string; code: string; lang: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={
              "text-xs font-mono px-3 py-1.5 rounded-lg border transition " +
              (i === active
                ? "bg-primary/15 text-primary border-primary/40"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40")
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock code={tabs[active].code} language={tabs[active].lang} />
    </div>
  );
}
