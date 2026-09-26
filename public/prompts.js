// ============================================================
// پرامپت‌های آماده برای تولید بنر — نسخه تفصیلی
// بهینه‌شده برای مدل‌های تصویری GapGPT
// ============================================================

const PROMPT_CATEGORIES = [
  // ============ ۱. تکنولوژی و شبکه هوشمند ============
  {
    id: "tech",
    name: "۱. تکنولوژی و شبکه هوشمند",
    items: [
      {
        name: "۱. کره شبکه آبی با پنل شیشه‌ای",
        prompt: "A premium corporate technology banner background designed for a formal engineering institution, deep navy blue to midnight blue smooth radial gradient field, a large photorealistic glowing wireframe globe positioned exactly at the center of the composition, the globe continents rendered as fine bright cyan dots connected by delicate thin cyan glowing lines forming a global data network, three concentric thin circular data arcs of different radii orbiting the globe with subtle glowing particle dust along their paths, eight small floating translucent hexagonal glass panels arranged in a symmetric ring around the globe at equal distances, each hexagon containing a subtle white minimalist icon silhouette: cloud, transmission tower, factory, wifi, server, industry, network and building, a large empty horizontal glassmorphic banner panel positioned in the upper-middle area with soft blue glow edges, brushed silver metallic corner brackets and a thin luminous cyan border, the panel interior is completely empty and reserved for a main title, a large empty hexagonal white brushed-metal panel floating at the very top center of the image, slightly elevated with soft blue rim light, reserved for a company logo, background decorated with fine subtle HUD lines, thin circuit traces and small glowing accent dots, dark low-poly cityscape silhouette at the very bottom edge with soft blue atmosphere glow, subtle particle bokeh floating across the scene, perfectly square 1:1 composition with symmetry and balanced negative space, uncluttered areas reserved for text overlay, high detail, professional, formal, elegant engineering-company aesthetic, cinematic depth of field, no text, no letters, no typography, no watermark, no logo images"
      },
      {
        name: "۲. کره شبکه طلایی روی مشکی",
        prompt: "A dramatic premium technology banner background for a high-voltage utility company, matte black to deep charcoal radial gradient field, a large glowing golden wireframe globe at the exact center with continents rendered as fine warm amber dots connected by delicate gold light lines forming a global energy network, three concentric thin golden orbit rings encircling the globe with subtle amber particle trails, small floating hexagonal icon panels evenly spaced around the globe containing minimalist golden symbols of electrical and industrial infrastructure, an empty dark glass panel with a fine gold metallic border positioned in the upper third of the image reserved for a headline, the panel interior completely clean and empty, a large empty golden circular ring at the very top center of the composition reserved for a company emblem, background enhanced with delicate HUD corner lines, thin geometric grid patterns and small glowing amber particles, a soft golden light bloom radiating from behind the globe, perfectly square 1:1 composition with strong vertical symmetry, generous negative space reserved for text overlay, cinematic, formal, elegant high-voltage engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. شش‌ضلعی تکنولوژی مینیمال",
        prompt: "A modern minimal technology banner background for a clean corporate engineering brand, deep charcoal navy smooth gradient field, a subtle large-scale hexagon grid pattern gently fading across the background, a few premium glossy translucent glass hexagons floating at various depths with soft cyan rim lighting, thin glowing cyan and white connection lines linking the hexagons into a subtle network pattern, a large empty dark rounded glass panel in the central-lower area of the image with a soft cyan border and subtle inner glow, the panel interior completely empty for text, an empty thin circular golden frame at the top center reserved for a company logo, minimal HUD corner accents and small glowing dots at the edges, soft volumetric light and gentle lens bloom, perfectly square 1:1 composition, clean, elegant, high-end modern engineering aesthetic with balanced negative space, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. نقشه شبکه جهانی",
        prompt: "A sophisticated global network banner background for an international utility company, deep royal navy to near-black gradient field, a stylized flat world map spanning the middle of the composition, the continents rendered as a dense constellation of glowing cyan dots and fine cyan connection lines, multiple elegant curved golden and cyan connection arcs rising out of the globe and crossing each other with subtle glowing endpoints, small bright connection nodes at key city locations with gentle bloom halos, a large empty horizontal dark panel across the middle-lower portion of the image with a thin cyan luminous border reserved for a text block, the interior of the panel kept completely empty, an empty thin circular glowing ring at the top center of the composition reserved for a company logo, subtle particle dust and soft bokeh, delicate HUD elements near the corners, perfectly square 1:1 composition with balanced negative space, cinematic, formal, modern corporate aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. مدار شهری از بالا",
        prompt: "A futuristic urban technology banner background inspired by smart-city infrastructure, deep black to dark navy gradient field, a stylized top-down aerial view of a city grid rendered as glowing golden circuit-board-like streets with warm amber connection nodes at every intersection, small bright glowing accents traveling along the streets like data streams, subtle building silhouettes suggested as tiny dark geometric blocks, a large empty dark glass panel in the lower third of the composition with a thin gold border reserved for a headline, the panel interior completely empty, an empty thin circular ring at the top center of the composition reserved for a company logo, subtle HUD corner accents and fine grid lines fading in the background, delicate atmospheric dust and soft bloom, perfectly square 1:1 composition with balanced negative space, cinematic, formal, high-tech urban engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۲. برج انتقال نیرو و انرژی ============
  {
    id: "towers",
    name: "۲. برج انتقال نیرو و انرژی",
    items: [
      {
        name: "۱. برج‌ها با امواج قرمز-طلایی",
        prompt: "A dramatic cinematic power energy banner background for a high-voltage utility company, deep near-black field combined with a vivid sunset gradient sky transitioning from intense orange near the horizon to deep magenta and dark blue at the top, sharp silhouettes of three tall electrical transmission towers of varying distances standing on the lower half of the composition, an intricate network of power cables and insulators crossing the sky, multiple thick dynamic flowing ribbons of glowing red and amber energy waves sweeping dramatically across the sky behind the towers with beautiful long-exposure light-trail effect, small bright glowing particles and sparks floating in the air, thin golden circuit HUD lines and small geometric corner brackets framing the composition near the edges, a large empty dark horizontal panel positioned in the lower-center of the image with a bold glowing amber-gold metallic border, brushed gold corner details and subtle inner shine, the panel interior completely empty for text, an empty circular gold ring with subtle rim light at the very top center reserved for a company logo, warm ambient light and atmospheric haze, perfectly square 1:1 composition with strong visual hierarchy, cinematic, richly detailed, formal utility company engineering aesthetic, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. برج‌ها در غروب نارنجی",
        prompt: "A cinematic banner background for a power transmission company, vivid dramatic sunset scene with a smooth gradient sky transitioning from intense orange and gold near the horizon to deep magenta and violet at the top, sharp black silhouettes of five tall electrical transmission towers of varying distances stretching across the composition from left to right, intricate details of power cables and insulator chains visible against the glowing horizon, small birds flying at a distance suggesting scale, an empty dark semi-transparent horizontal panel positioned in the lower third of the image with a fine golden border reserved for a text block, the panel interior completely empty, an empty thin circular gold ring at the top center of the composition reserved for a company logo, soft atmospheric haze and warm dust particles, subtle HUD corner accents in gold, perfectly square 1:1 composition with balanced negative space, cinematic, richly detailed, formal utility company aesthetic, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. برج‌ها در شب با چراغ‌های شهر",
        prompt: "A moody cinematic banner background for an electrical utility company, deep blue to midnight black gradient night sky filled with fine stars and subtle Milky Way detail, sharp silhouettes of four tall transmission towers and intricate power lines crossing the composition on the lower half, distant faint golden city lights glowing on the horizon line beneath the towers, delicate blue rim lighting on the tower edges suggesting moonlight, an empty dark horizontal glass panel at the upper third of the image with a fine blue border reserved for a headline, the panel interior completely empty, an empty thin circular ring at the top center reserved for a company logo, subtle HUD corner accents and fine particle dust, perfectly square 1:1 composition, cinematic, elegant, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. پست برق در گرگ‌ومیش",
        prompt: "A detailed professional banner background for an industrial engineering company, twilight scene with a deep blue to warm amber gradient sky, a large electrical substation in the middle ground featuring multiple large steel lattice transformers, insulators, thick cables and intricate metallic framework with visible mechanical details, warm amber accent lighting glowing from small lamp posts and reflections on metallic surfaces, subtle atmospheric haze and slight fog near the ground, an empty dark semi-transparent panel on the right side of the composition with a thin gold border reserved for text, the panel interior completely empty, an empty thin circular gold ring in the upper left area reserved for a company logo, fine HUD corner accents, subtle particle dust, perfectly square 1:1 composition, cinematic, professional industrial engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. برج‌ها با امواج پلاسمای آبی-طلایی",
        prompt: "A dynamic cinematic banner background for a modern power company, deep midnight-blue to black radial gradient field, sharp silhouettes of three tall electrical transmission towers standing on the lower half of the composition with intricate cable and insulator details, multiple dramatic glowing plasma-like energy ribbons in vibrant electric blue and warm gold sweeping across the sky behind the towers with beautiful long-exposure light trails and particle sparks flying off them, small bright glowing embers floating in the air, thin HUD circuit lines and subtle geometric corner accents in blue and gold framing the composition, an empty dark horizontal glass panel in the lower center with a bold cyan and gold dual-border reserved for text, the panel interior completely empty, an empty circular ring with dual cyan and gold rim light at the top center reserved for a company logo, atmospheric haze, perfectly square 1:1 composition, cinematic, richly detailed, formal high-voltage engineering aesthetic, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۳. HUD صنعتی و مدرن ============
  {
    id: "hud",
    name: "۳. HUD صنعتی و مدرن",
    items: [
      {
        name: "۱. HUD طلایی روی مشکی",
        prompt: "A futuristic industrial HUD banner background for a formal engineering company, matte black to deep charcoal gradient field, intricate golden HUD frame lines with precision geometric corner brackets framing the entire composition, small detailed circuit nodes and connection points along the frame edges, thin diagonal golden accent lines and small glowing amber particles, subtle hexagonal grid pattern fading in the background, a large empty dark central area reserved for a headline or multiple lines of text, a small empty circular gold frame with subtle rim light at the top center of the composition reserved for a company logo, minimal high-tech decorations at the corners, subtle volumetric light and gentle lens bloom, perfectly square 1:1 composition with balanced negative space, minimal, elegant, formal high-voltage engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. HUD آبی با خطوط نورانی",
        prompt: "A modern technology HUD banner background for a clean corporate engineering brand, deep navy to near-black gradient field, thin cyan glowing frame lines with precision corner brackets at each edge of the composition, small detailed glowing cyan connection nodes at the corners, thin diagonal cyan accent lines and small particle dots, subtle large-scale hexagonal pattern fading gently into the background, a large empty dark central area reserved for a headline block, a small empty circular cyan glowing frame at the top center of the composition reserved for a company logo, minimal HUD decorations, soft volumetric bloom and delicate particle dust, perfectly square 1:1 composition, clean, modern, formal corporate engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. مدار طلایی روی سطح فلزی",
        prompt: "A refined industrial premium banner background for a high-end engineering company, brushed dark metal surface with fine vertical micro-scratches and subtle metallic sheen, intricate golden circuit-trace patterns emerging elegantly from all four corners and reaching toward the center, small glowing amber connection nodes where circuit traces intersect, subtle warm golden rim light catching the metal texture, a large empty dark rectangular panel in the central area of the composition with a thin gold border and subtle inner glow reserved for text, the panel interior completely empty, a small empty circular gold frame at the top center reserved for a company logo, fine HUD corner accents, subtle floating amber dust particles, perfectly square 1:1 composition with strong sense of depth, refined, formal, high-end engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. شبکه گره‌های نورانی طلایی",
        prompt: "A rich abstract technology banner background for a modern energy utility company, deep blue-black radial gradient field, a fine interconnected network of hundreds of glowing golden nodes of varying sizes connected by delicate thin light-lines spread across the entire composition like a constellation or neural network, subtle depth and glow between the closer and further nodes, small bright connection particles traveling along the lines, a large empty dark area in the lower third of the image reserved for text overlay, a small empty circular golden frame with subtle rim light at the top center reserved for a company logo, fine HUD accents near the corners, soft atmospheric bloom, perfectly square 1:1 composition with balanced negative space, elegant, formal engineering energy aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. مدار سه‌بعدی با عمق نوری",
        prompt: "A dramatic cinematic technology banner background for a futuristic engineering company, deep black to midnight-blue gradient field, a three-dimensional glowing circuit structure receding deep into the composition creating a strong sense of perspective and depth, multiple layers of fine blue and warm amber light trails flowing along the circuit pathways at different depths, small bright glowing nodes at each junction, atmospheric haze fading into the distance, a large empty dark area in the lower third of the image reserved for text, a small empty circular glowing frame at the top center of the composition reserved for a company logo, fine HUD corner accents, subtle particle bokeh, perfectly square 1:1 composition, cinematic, futuristic, formal engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۴. قاب طلایی و اسلیمی ایرانی ============
  {
    id: "gold",
    name: "۴. قاب طلایی و اسلیمی ایرانی",
    items: [
      {
        name: "۱. قاب طلایی سرمه‌ای کلاسیک",
        prompt: "An elegant formal Persian ornamental banner background for a prestigious government utility company, deep navy blue smooth field, a complete and fully visible intricate golden Persian arabesque (eslimi) ornamental frame surrounding the entire composition with comfortable margins from the edges, ornate detailed filigree corner medallions in all four corners with fine scrollwork details, delicate Islamic geometric patterns and floral motifs woven continuously along all four borders, warm golden ambient light glowing gently from within the frame, a large empty dark navy central field completely clear and uncluttered reserved for text overlay, a small empty circular gold ornamental medallion at the top center of the composition reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with strong symmetry and generous negative space, richly detailed, elegant, formal, dignified government utility company aesthetic, ultra-detailed, no text, no letters, no typography, no cropped edges, no watermark"
      },
      {
        name: "۲. قاب زمردی با حاشیه طلا",
        prompt: "A luxurious formal Persian ornamental banner background for a prestigious engineering institution, deep emerald green smooth field, a complete and fully visible ornate golden Persian floral arabesque border surrounding the entire composition with comfortable margins, intricate detailed filigree corner ornaments in all four corners with fine flower and vine details, delicate engraved geometric line-work along all four frame edges with Persian tilework motifs, soft warm golden ambient glow, a large empty dark emerald central panel completely clear and uncluttered reserved for text overlay, a small empty circular gold ornamental medallion at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition, richly detailed, dignified, formal engineering institution aesthetic, ultra-detailed, no text, no letters, no typography, no cropped edges, no watermark"
      },
      {
        name: "۳. قاب سرخابی تیره با طلاکاری",
        prompt: "A dignified formal Persian ornamental banner background for a government utility company, deep maroon and burgundy smooth field, an intricate gold Persian ornamental border with fine arabesque scrollwork surrounding the entire composition with comfortable margins, detailed golden rosettes and floral motifs in all four corners, subtle embossed textured details on the golden ornaments catching warm light, delicate geometric patterns woven along all four borders, a large empty deep burgundy central field completely clear and uncluttered reserved for text overlay, a small empty circular gold ornamental medallion at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with strong symmetry, elaborate, dignified, formal government utility aesthetic, ultra-detailed, no text, no letters, no typography, no cropped edges, no watermark"
      },
      {
        name: "۴. قاب مشکی و طلای مدرن",
        prompt: "A refined formal Persian ornamental banner background for a high-end engineering company, matte black smooth field, a complete and fully visible sleek modern golden Persian geometric border pattern surrounding the entire composition with comfortable margins, fine linear arabesque motifs and delicate geometric patterns woven along all four edges, subtle metallic sheen on the golden ornaments catching soft warm light, minimal glow accents, a large empty deep black central field completely clear and uncluttered reserved for text overlay, a small empty circular gold geometric medallion at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with strong symmetry, elegant and high-end, formal engineering company aesthetic, ultra-detailed, no text, no letters, no typography, no cropped edges, no watermark"
      },
      {
        name: "۵. قاب اسلیمی با فضای زیاد برای متن",
        prompt: "A refined formal Persian ornamental banner background for a modern utility company, deep charcoal navy smooth field, a complete and fully visible slender but highly detailed golden Persian arabesque border surrounding the entire composition with comfortable margins, fine engraved golden corner ornaments with delicate scrollwork in all four corners, subtle golden particle glow along the frame edges, a very generous empty central area completely clear and uncluttered reserved for multiple lines of text overlay, a small empty circular gold ornamental medallion at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with strong symmetry, elegant, dignified, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no cropped edges, no watermark"
      }
    ]
  },

  // ============ ۵. بلوپرینت مهندسی ============
  {
    id: "blueprint",
    name: "۵. بلوپرینت مهندسی",
    items: [
      {
        name: "۱. بلوپرینت آبی کلاسیک",
        prompt: "A detailed technical blueprint-style banner background for a professional engineering company, deep cyan-blue smooth field covered with fine bright white engineering grid lines running across the entire composition, intricate schematic diagrams of an electrical substation and transmission towers etched in thin precise white linework, subtle cross-hatching and dimension markings with small measurement numbers, detailed technical annotations, a large clear rectangular empty panel in the center of the composition kept completely free of linework reserved for text overlay, a small empty circular technical frame at the top center reserved for a company logo, subtle particle dust and light grid fading in the background, perfectly square 1:1 composition with balanced negative space, highly detailed, precise, professional engineering aesthetic, ultra-detailed, no text, no letters, no numbers, no typography, no watermark"
      },
      {
        name: "۲. نقشه ایزومتریک پست برق",
        prompt: "A detailed isometric technical illustration banner background for a professional engineering company, muted blue-grey smooth palette, a highly detailed isometric line-art diagram of an electrical substation at the center featuring large transformers, transmission towers, insulators and intricate cabling rendered in fine white and cyan linework on a dark background, subtle cross-hatching, dimension lines and technical annotation marks, soft cyan glow accents along key structural lines, a large empty dark area at the top of the composition reserved for a title, a small empty circular technical frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition, precise, richly detailed, professional engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. کاغذ میلی‌متری با طرح شبکه برق",
        prompt: "A technical banner background resembling a hand-drafted engineering drawing on fine graph paper, pale blue-white smooth paper texture with a delicate millimeter grid printed across the entire composition, overlaid with thin precise schematic outlines of power lines, pylons, transformers and small substation symbols drawn in navy ink, subtle hand-drafted details like compass marks and dimension arrows, faint pencil hatching, a large empty clean panel in the central-right area of the composition reserved for text overlay, a small empty circular technical frame at the top left reserved for a company logo, subtle paper texture and slight aging, perfectly square 1:1 composition, detailed yet clean, formal engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. مدار طلایی روی مشکی",
        prompt: "A dense technical banner background for a high-tech engineering company, matte charcoal-black to deep blue gradient field, intricate golden circuit-trace patterns spreading across the entire composition with layered schematic complexity resembling a premium printed circuit board, small glowing amber connection nodes where circuit lines intersect, subtle warm golden ambient glow at the junctions, a large empty dark rectangular zone in the lower third of the composition with a thin gold border reserved for text overlay, the panel interior completely empty, a small empty circular gold frame at the top center reserved for a company logo, fine HUD corner accents, perfectly square 1:1 composition with balanced negative space, richly detailed, formal high-tech engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. نقشه شبکه سراسری برق",
        prompt: "A sophisticated technical banner background depicting a stylized national power-grid network map, deep navy blue smooth field, dozens of glowing golden node points connected by fine curved golden transmission lines spreading across the entire composition in the shape of a country or region, subtle geographic contour hints in the background, small bright glowing particles at each major connection node, delicate topographic line details, a large empty dark area in the central portion of the composition reserved for text overlay, a small empty circular gold frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, richly detailed, formal engineering institution aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۶. شهر شب و شبکه برق ============
  {
    id: "city",
    name: "۶. شهر شب و شبکه برق",
    items: [
      {
        name: "۱. افق شهر شبانه با شبکه برق",
        prompt: "A dramatic cinematic banner background for an urban utility company, deep navy-to-black radial gradient night sky, sharp silhouettes of a large city skyline at the bottom edge of the composition with countless tiny warm golden window lights glowing, intricate network of thin glowing golden power-grid lines connecting across the sky in elegant geometric curves with small bright glowing nodes at key junctions, subtle atmospheric haze around the buildings, a large empty dark area in the upper sky portion of the composition reserved for text overlay, a small empty circular gold frame in the upper center reserved for a company logo, fine star details in the sky, subtle particle dust, perfectly square 1:1 composition with balanced negative space, cinematic, richly detailed, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. شهر شب از بالا",
        prompt: "A striking aerial cinematic banner background for a modern utility company, dramatic nighttime cityscape viewed from a high angle, warm golden street-light patterns forming a glowing intricate grid across the composition, deep dark base tones with rich contrast, subtle atmospheric haze and light bloom around the brightest areas, delicate particle dust floating in the air, a large empty dark area in the lower third of the composition reserved for text overlay, a small empty circular gold frame in the upper center reserved for a company logo, subtle HUD corner accents, perfectly square 1:1 composition with balanced negative space, elegant, cinematic, formal utility engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. برج مخابراتی با آسمان ستاره‌باران",
        prompt: "A serene cinematic banner background for a communication and power infrastructure company, deep clear night sky filled with fine detailed stars and a soft glowing Milky Way band across the composition, sharp silhouette of a tall lattice communication tower with intricate structural details standing in the middle-left area, faint blue rim lighting catching the metal structure, subtle atmospheric haze, a large empty dark sky area in the upper and lower portions of the composition reserved for text overlay, a small empty circular glowing frame in the upper center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, elegant, cinematic, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. پل و انعکاس شهر در رودخانه",
        prompt: "An atmospheric cinematic banner background for an urban utility company, calm river surface occupying the lower half of the composition reflecting a glowing city skyline and a bridge silhouette with intricate structural details, deep blue-black tones with warm golden and cool blue light accents, subtle glowing power lines crossing the sky above the bridge, gentle ripples on the water creating soft light reflections, a large empty dark sky area in the upper portion reserved for text overlay, a small empty circular glowing frame in the upper center reserved for a company logo, subtle atmospheric haze and particle dust, perfectly square 1:1 composition with balanced negative space, cinematic, richly detailed, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. خط افق شهر با گرادیان غروب",
        prompt: "A cinematic banner background for a modern utility company, wide city skyline transitioning from a warm golden sunset glow near the horizon into a deep navy blue night sky above, sharp silhouettes of power infrastructure, transmission towers and power lines in the foreground with fine structural details, subtle glowing warm light catching the metallic edges of the infrastructure, atmospheric haze and warm dust particles near the horizon, a large empty gradient sky area in the upper portion of the composition reserved for text overlay, a small empty circular golden frame in the upper center reserved for a company logo, perfectly square 1:1 composition with balanced negative space, cinematic, richly detailed, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۷. هشدار و فوریت ============
  {
    id: "alert",
    name: "۷. هشدار و فوریت",
    items: [
      {
        name: "۱. راه‌راه زرد-مشکی کلاسیک",
        prompt: "A bold urgent-alert banner background for an electrical safety notice, dramatic dark charcoal to deep black gradient field, strong border pattern of classic diagonal yellow and black electrical hazard stripes running along the top and bottom edges of the composition, a subtle radial amber glow emanating from the center, small glowing safety iconography gently fading into the background, a large empty dark central area reserved for bold warning text, a small empty circular amber glowing frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, formal high-visibility engineering safety aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. هشدار قرمز با جرقه",
        prompt: "A dramatic urgent-alert banner background for an emergency engineering notice, deep black gradient field, fine glowing red and amber electric spark fractals concentrated dramatically in one corner of the composition, subtle warning-tape texture running along the bottom edge, thin red and amber accent lines crossing the frame, small glowing embers floating in the air, a large empty dark central panel reserved for bold warning text, a small empty circular red and amber glowing frame at the top center reserved for a company logo, subtle atmospheric haze and particle dust, perfectly square 1:1 composition, formal emergency engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. نشان مثلثی هشدار",
        prompt: "A striking urgent-alert banner background for a safety warning notice, deep charcoal to black gradient field, a large subtle glowing amber triangular hazard-symbol silhouette softly lit in one corner of the composition with soft light rays emanating outward, thin diagonal amber accent lines crossing the frame, small glowing particles floating in the air, a large empty dark central area reserved for text, a small empty circular amber glowing frame at the top center reserved for a company logo, subtle atmospheric haze, perfectly square 1:1 composition with balanced negative space, formal safety engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. هشدار نارنجی با مه دود",
        prompt: "A tense urgent-alert banner background for an emergency engineering mood, deep charcoal to black gradient field with a soft glowing orange-amber haze rising dramatically from the bottom edge of the composition, subtle atmospheric smoke-like texture drifting across the frame, thin hazard-stripe accent running along the base, small glowing embers floating in the air, a large empty dark upper area reserved for text, a small empty circular amber glowing frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, formal emergency engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. هشدار مینیمال با خط قرمز",
        prompt: "A restrained but striking urgent-alert banner background for a high-alert engineering notice, deep charcoal to black gradient field, a single bold thin red accent line crossing diagonally near one edge of the composition with a subtle amber glow where it meets the corner, small red particles floating subtly in the air, a large empty dark central area reserved for text, a small empty circular red glowing frame at the top center reserved for a company logo, minimal HUD accents near the corners, perfectly square 1:1 composition with balanced negative space, formal high-alert engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۸. انرژی انتزاعی ============
  {
    id: "energy",
    name: "۸. انرژی انتزاعی",
    items: [
      {
        name: "۱. رعد و برق طلایی-آبی",
        prompt: "A dramatic abstract banner background for an energy company, deep black gradient field, intricate branching golden and electric-blue lightning-bolt fractal patterns radiating dramatically from one corner of the composition, fine glowing energy tendrils spreading across the frame with beautiful complexity, small bright glowing sparks and particle embers flying off the tendrils, subtle atmospheric haze and volumetric light, a large empty dark central panel reserved for text, a small empty circular glowing frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, dynamic yet formal engineering energy aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. کره انرژی درخشان",
        prompt: "A striking abstract banner background for a modern energy company, deep navy to black gradient field, a large glowing spherical core of blue-white energy positioned at one side of the composition radiating elegant fine golden light filaments outward across the field, subtle particle glow around the sphere, small bright sparks floating in the air, a large empty dark area on the opposite side of the composition reserved for text overlay, a small empty circular glowing frame at the top center reserved for a company logo, subtle atmospheric haze, perfectly square 1:1 composition with balanced negative space, elegant, formal energy company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. جریان‌های پلاسمایی",
        prompt: "A dynamic abstract banner background for a high-tech energy company, deep charcoal to black gradient field, multiple parallel flowing ribbons of glowing cyan and warm gold plasma-like light streaking horizontally across the composition, each ribbon made of many fine particle trails with beautiful motion blur, small bright sparks flying off the ribbons, subtle atmospheric haze and volumetric bloom, a large empty central band across the middle of the composition reserved for text overlay, a small empty circular glowing frame at the top center reserved for a company logo, perfectly square 1:1 composition with balanced negative space, formal high-tech energy aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. امواج انرژی هم‌مرکز",
        prompt: "An elegant abstract banner background for a formal utility company, deep navy to black radial gradient field, multiple concentric glowing golden energy rings radiating outward from the upper corner of the composition with soft fading edges, fine light particle dust catching the ring glow, subtle atmospheric haze creating depth, a large empty dark area in the lower half of the composition reserved for text overlay, a small empty circular golden glowing frame at the top center reserved for a company logo, perfectly square 1:1 composition with balanced negative space, dignified, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. هاله نور طلایی",
        prompt: "A refined abstract banner background for a prestigious utility company, deep charcoal-navy radial gradient field, a soft warm golden light halo glowing gently behind the composition creating an elegant atmospheric effect, fine subtle light-ray texture radiating from the center, small golden particle dust floating gently across the frame, a large empty central area reserved for text overlay, a small empty circular golden glowing frame at the top center reserved for a company logo, subtle atmospheric haze, perfectly square 1:1 composition with balanced negative space, elegant, formal utility company aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  },

  // ============ ۹. ترکیب اسلیمی و مدار ============
  {
    id: "fusion",
    name: "۹. ترکیب اسلیمی و مدار",
    items: [
      {
        name: "۱. کاشی‌کاری با رگه‌های مدار",
        prompt: "A striking fusion banner background combining Persian traditional art with modern technology, deep navy blue smooth base field, a traditional Persian blue-and-gold tilework geometric pattern covering the middle portion of the composition and subtly transforming into fine glowing circuit-board traces at the edges, small amber glowing nodes at key pattern intersections, elegant symmetry, a large empty central panel reserved for text overlay, a small empty circular traditional gold medallion at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, formal culture-meets-engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. مقرنس با نور آبی مدار",
        prompt: "An intricate fusion banner background combining Persian architecture with modern electronics, deep stone-grey smooth field, a highly detailed Persian muqarnas honeycomb-vault pattern covering the composition rendered with fine architectural details, subtly illuminated from within by soft glowing electric-blue circuit lines running along the architectural edges, small bright glowing nodes at key intersections, elegant symmetry, a large empty central area reserved for text overlay, a small empty circular traditional medallion at the top center reserved for a company logo, subtle atmospheric haze, perfectly square 1:1 composition, formal architectural engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. گنبد اسلیمی با نقشه مدار",
        prompt: "A dramatic fusion banner background combining Persian heritage with modern technology, deep navy smooth sky field, an elegant detailed silhouette of an ornate Persian dome pattern rendered in warm gold standing at the lower center of the composition, the sky above filled with fine glowing golden circuit-diagram constellations resembling stars connected by delicate lines, small bright connection nodes glowing at key points, a large empty sky area in the upper portion reserved for text overlay, a small empty circular traditional golden medallion at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, elegant, formal cultural engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. پنجره مشبک با نور آبی",
        prompt: "An elegant fusion banner background combining Persian architectural craft with modern lighting, dark bronze to black gradient field, an intricate Persian mashrabiya-style wooden lattice window silhouette rendered in fine detail at the center of the composition, backlit by a soft glowing electric-blue light emanating from behind the lattice creating beautiful geometric light patterns and shadows, small glowing particles floating in the air, a large empty dark area in the lower portion reserved for text overlay, a small empty circular traditional glowing frame at the top center reserved for a company logo, subtle atmospheric haze, perfectly square 1:1 composition with balanced negative space, formal architectural technology aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. خوشنویسی انتزاعی با مدار",
        prompt: "A refined fusion banner background combining Persian calligraphic art with modern electronics, deep navy smooth field, abstract flowing calligraphic-style golden linework spreading elegantly across the composition in the shape of decorative swirls, purely ornamental patterns that do not form any actual letters or words, softly interwoven with fine glowing cyan circuit-line accents, small bright glowing nodes at key intersections, elegant asymmetry, a large empty central panel reserved for text overlay, a small empty circular traditional golden frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, elegant, formal cultural engineering aesthetic, ultra-detailed, no text, no letters, no typography, no legible script, no watermark"
      }
    ]
  },

  // ============ ۱۰. هندسی تخت و مدرن ============
  {
    id: "flat",
    name: "۱۰. هندسی تخت و مدرن",
    items: [
      {
        name: "۱. الگوی شش‌ضلعی آبی-طلایی",
        prompt: "A bold flat-design banner background for a modern engineering brand, a dense tessellated pattern of navy-blue and warm gold hexagons of varying shades covering the entire composition, clean minimal vector style with sharp geometric edges, subtle shadow layering between hexagons creating gentle depth, a large empty solid navy rectangular panel in one corner of the composition reserved for text overlay, a small empty circular solid gold frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, richly detailed yet clean, formal modern engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۲. نوارهای هندسی زاویه‌دار",
        prompt: "A dynamic flat-design banner background for a modern corporate brand, densely layered angular geometric stripes in deep blue, teal and gold sweeping diagonally across the composition with clean crisp edges, subtle shadow effects between layers adding gentle three-dimensional depth, small bright geometric accents at key intersections, a large empty solid-color band across the bottom of the composition reserved for text overlay, a small empty circular solid frame at the top center reserved for a company logo, perfectly square 1:1 composition with balanced negative space, richly detailed, formal modern aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۳. دایره‌های هم‌پوشان",
        prompt: "A vivid flat-design banner background for a modern utility brand, many overlapping semi-transparent circles in shades of blue, gold and teal densely arranged in one half of the composition creating beautiful moiré and layered color effects, clean minimal vector style with sharp edges, small bright accents at key overlaps, a large empty solid-color area on the opposite side of the composition reserved for text overlay, a small empty circular solid frame at the top center reserved for a company logo, perfectly square 1:1 composition, richly detailed, formal modern aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۴. الگوی مثلثی کریستالی",
        prompt: "A striking flat-design banner background for a modern technology brand, a dense field of small triangular facets in varying shades of blue and gold forming a crystalline low-poly texture across the composition, clean minimal vector style with sharp edges and subtle color gradients between adjacent triangles, small bright accents at key intersections, a large empty solid-color central panel reserved for text overlay, a small empty circular solid frame at the top center reserved for a company logo, subtle particle dust, perfectly square 1:1 composition with balanced negative space, richly detailed, formal modern engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      },
      {
        name: "۵. الگوی لوزی با گرادیان طلایی",
        prompt: "A bold flat-design banner background for a modern energy brand, a dense repeating diamond tile pattern transitioning smoothly from navy blue at one side to warm gold at the other side across the composition, clean minimal vector style with sharp geometric edges, subtle shading between tiles adding gentle depth, small bright glowing accents at key intersections, a large empty solid-color panel in one portion reserved for text overlay, a small empty circular solid frame at the top center reserved for a company logo, perfectly square 1:1 composition with balanced negative space, richly detailed, formal modern engineering aesthetic, ultra-detailed, no text, no letters, no typography, no watermark"
      }
    ]
  }
];