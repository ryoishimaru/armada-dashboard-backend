import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

class webManagerService {
  navCategories = {
    haircare: `<li><a id="nav_haircare" href="<?php echo $Path; ?>#haircare"><span>ヘアケア</span></a></li>`,
    skincare: `<li><a id="nav_skincare" href="<?php echo $Path; ?>#skincare"><span>スキンケア・洗顔</span></a></li>`,
    supplement: `<li><a id="nav_supplement" href="<?php echo $Path; ?>#supplement"><span>健康食品</span></a></li>`,
    mozu: `<li><a id="nav_mozu" href="<?php echo $Path; ?>#mozu"><span>もずの魔法シリーズ</span></a></li>`,
    gs_tea: `<li><a id="nav_gstea" href="<?php echo $Path; ?>#gstea"><span>セイロン（スリランカ）紅茶</span></a></li>`,
    others: `<li><a id="nav_others" href="<?php echo $Path; ?>#others"><span>日用品・その他</span></a></li>`,
  };

  mainCategories = {
    haircare: `<div class="col-md-4"><a href="#haircare"><p>ヘアケア</p><div class="img_wrap"><img src="../common/img_webp/category_haircare.webp" alt="ヘアケア"></div></a></div>`,
    skincare: `<div class="col-md-4"><a href="#skincare"><p>スキンケア・洗顔</p><div class="img_wrap"><img src="../common/img_webp/category_skincare.webp" alt="スキンケア・洗顔"></div></a></div>`,
    supplement: `<div class="col-md-4"><a href="#supplement"><p>健康食品</p><div class="img_wrap"><img src="../common/img_webp/category_supplement.webp" alt="健康食品"></div></a></div>`,
    mozu: `<div class="col-md-4"><a href="#mozu"><p>もずの魔法シリーズ</p><div class="img_wrap"><img src="../common/img_webp/category_mozu.webp" alt="もずの魔法シリーズ"></div></a></div>`,
    gs_tea: `<div class="col-md-4"><a href="#gstea"><p>セイロン（スリランカ）紅茶</p><div class="img_wrap"><img src="../common/img_webp/category_gstea.webp" alt="セイロン（スリランカ）紅茶"></div></a></div>`,
    others: `<div class="col-md-4"><a href="#others"><p>日用品・その他</p><div class="img_wrap"><img src="../common/img_webp/category_others.webp" alt="日用品・その他"></div></a></div>`,
  };

  subCategories = {
    haircare: {
      baseHtml: `<section id="haircare" class="menu"><h3>ヘアケア</h3>__REPLACE_PRODUCT_PLACEHOLDER__<section>`,
      'm3_5.html': `  <div class="col-md-3"><a href="haircare/m3_5.html"><p>M3.6</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_m36_200.webp" alt="M3.5"></div></a></div>`,
      'p3_4.html': `  <div class="col-md-3"><a href="haircare/p3_4.html"><p>P3.4/P4.3</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_p34_2021_200.webp" alt="P3.4/P4.3"></div></a></div>`,
      's_shampoo.html': `  <div class="col-md-3"><a href="haircare/s_shampoo.html"><p>Sシリーズシャンプー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_sshampoo_300.webp" alt="Sシリーズシャンプー"></div></a></div>`,
      'amelior_lotion.html': `  <div class="col-md-3"><a href="haircare/amelior_lotion.html"><p>アメリオールクレンジングローション</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_amelior_l300.webp" alt="アメリオールクレンジングローション"></div></a></div>`,
      'amelior_shampoo.html': `  <div class="col-md-3"><a href="haircare/amelior_shampoo.html"><p>アメリオール薬用シャンプー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_amelior_s300.webp" alt="アメリオール薬用シャンプー"></div></a></div>`,
      'amelior_pro.html': `  <div class="col-md-3"><a href="haircare/amelior_pro.html"><p>アメリオールプロ</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_amelior_p.webp" alt="アメリオールプロ"></div></a></div>`,
      'aeteno.html': `  <div class="col-md-3"><a href="haircare/aeteno.html"><p>AETENO</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_aeteno.webp" alt="AETENO"></div></a></div>`,
      'iqmo_essence.html': `  <div class="col-md-3"><a href="haircare/iqmo_essence.html"><p>イクモエッセンス</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_iqmo_e.webp" alt="イクモエッセンス"></div></a></div>`,
      'iqmo_premium.html': `  <div class="col-md-3"><a href="haircare/iqmo_premium.html"><p>イクモプレミアムエッセンス</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_iqmo_premium.webp" alt="イクモプレミアムエッセンス"></div></a></div>`,
      'siberian_shampoo.html': `  <div class="col-md-3"><a href="haircare/siberian_shampoo.html"><p>シベリアシャンプー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_siberian.webp" alt="シベリアシャンプー"></div></a></div>`,
      'yonaga_shampoo.html': `  <div class="col-md-3"><a href="haircare/yonaga_shampoo.html"><p>ヨナガシャンプー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_yonaga.webp" alt="ヨナガシャンプー"></div></a></div>`,
      'monsoon_shampoo2021.html': `  <div class="col-md-3"><a href="haircare/monsoon_shampoo2021.html"><p>モンスーンシャンプー2021</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_monsoon2021.webp" alt="モンスーンシャンプー2021"></div></a></div>`,
      'moeeee_shampoo.html': `  <div class="col-md-3"><a href="haircare/moeeee_shampoo.html"><p>モエーシャンプー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_moeeee.webp" alt="モエーシャンプー"></div></a></div>`,
      'siberian_strong.html': `  <div class="col-md-3"><a href="haircare/siberian_strong.html"><p>シベリアシャンプー ストロング</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_siberian_strong.webp" alt="シベリアシャンプー"></div></a></div>`,
      'yosamu_shampoo.html': `  <div class="col-md-3"><a href="haircare/yosamu_shampoo.html"><p>ヨサムシャンプー</p><div class="img_wrap"><img src="../common/img_webp/item_haircare_yosamu.webp" alt="ヨサムシャンプー"></div></a></div>`,
      'monsoon_shampoo2022.html': `  <div class="col-md-3"><a href="haircare/monsoon_shampoo2022.html"><p>モンスーンシャンプー2022</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_haircare_monsoon2022.webp" alt="モンスーンシャンプー2022"></div></a></div>`,
      'odesa_shampoo.html': `  <div class="col-md-3"><a href="haircare/odesa_shampoo.html"><p>オデッサシャンプー</p><div class="img_wrap"><img src="../common/img_webp/item_haircare_odesa.webp" alt="オデッサシャンプー"></div></a></div>`,
      'erimo_shampoo.html': `  <div class="col-md-3"><a href="haircare/erimo_shampoo.html"><p>エリモシャンプー</p><div class="img_wrap"><img src="../common/img_webp/item_haircare_erimo.webp" alt="エリモシャンプー"></div></a></div>`,
      'karuizawa_shampoo.html': `  <div class="col-md-3"><a href="haircare/karuizawa_shampoo.html"><p>軽井沢シャンプー</p><div class="img_wrap"><img src="../common/img_webp/item_haircare_karuizawa.webp" alt="軽井沢シャンプー"></div></a></div>`,
      'tsukishiro_shampoo.html': `  <div class="col-md-3"><a href="haircare/tsukishiro_shampoo.html"><p>月魄シャンプー</p><div class="img_wrap"><img src="../common/img_webp/item_haircare_tsukishiro.webp" alt="月魄シャンプー"></div></a></div>`,
      'winter_rich_shampoo.html': `  <div class="col-md-3"><a href="haircare/winter_rich_shampoo.html"><p>ウィンターリッチシャンプー</p><div class="img_wrap"><img src="../common/img_webp/item_haircare_winterrich_all.webp" alt="ウィンターリッチシャンプー"></div></a></div>`,
    },
    skincare: {
      baseHtml: `<section id="skincare" class="menu"><h3>スキンケア・洗顔</h3>__REPLACE_PRODUCT_PLACEHOLDER__<section>`,
      'itsukano_sekken.html': `  <div class="col-md-3"><a href="skincare/itsukano_sekken.html"><p>いつかの石けん</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_itsukano_sk.webp" alt="いつかの石けん"></div></a></div>`,
      'ganbare_watashi.html': `  <div class="col-md-3"><a href="skincare/ganbare_watashi.html"><p>ガンバレワタシ</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_gw.webp" alt="ガンバレワタシ"></div></a></div>`,
      'umor.html': `  <div class="col-md-3"><a href="skincare/umor.html"><p>UMOR</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_umor.webp" alt="UMOR"></div></a></div>`,
      'c-7.html': `  <div class="col-md-3"><a href="skincare/c-7.html"><p>C-7</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_c7.webp" alt="C-7"></div></a></div>`,
      'emulsion_remover.html': `  <div class="col-md-3"><a href="skincare/emulsion_remover.html"><p>エマルジョンリムーバー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_emulsion_300.webp" alt="エマルジョンリムーバー"></div></a></div>`,
      'egutam.html': `  <div class="col-md-3"><a href="skincare/egutam.html"><p>EGUTAM</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_egutam.webp" alt="EGUTAM"></div></a></div>`,
      'egutam_mascara.html': `  <div class="col-md-3"><a href="skincare/egutam_mascara.html"><p>EGUTAMマスカラ</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_egutam_mascara.webp" alt="EGUTAMマスカラ"></div></a></div>`,
      'sricorm.html': `  <div class="col-md-3"><a href="skincare/sricorm.html"><p>SRICORM</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_sricorm.webp" alt="SRICORM"></div></a></div>`,
      'itsukano_ashiura.html': `  <div class="col-md-3"><a href="skincare/itsukano_ashiura.html"><p>いつかの足裏石けん</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_itsukano_au.webp" alt="いつかの足裏石けん"></div></a></div>`,
      'itsukano_cleansing.html': `  <div class="col-md-3"><a href="skincare/itsukano_cleansing.html"><p>いつかのクレンジング</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_itsukano_cl.webp" alt="いつかのクレンジング"></div></a></div>`,
      'pida.html': `  <div class="col-md-3"><a href="skincare/pida.html"><p>Pida</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_pida.webp" alt="Pida"></div></a></div>`,
      'pida2.html': `  <div class="col-md-3"><a href="skincare/pida2.html"><p>Pida II</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_pida2.webp" alt="Pida II"></div></a></div>`,
      'gatto_lash.html': `  <div class="col-md-3"><a href="skincare/gatto_lash.html"><p>gatto lash</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_gatto.webp" alt="gatto lash"></div></a></div>`,
      'itsukano_yakuyo.html': `  <div class="col-md-3"><a href="skincare/itsukano_yakuyo.html"><p>薬用いつかの石けん</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_itsukano_yy.webp" alt="薬用いつかの石けん"></div></a></div>`,
      'astring.html': `  <div class="col-md-3"><a href="skincare/astring.html"><p>A string</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_astring.webp" alt="A string"></div></a></div>`,
      'golumayu.html': `  <div class="col-md-3"><a href="skincare/golumayu.html"><p>GOLUMAYU</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_golumayu.webp" alt="GOLUMAYU"></div></a></div>`,
      'futaekeep.html': `  <div class="col-md-3"><a href="skincare/futaekeep.html"><p>FUTAE KEEP</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_futae_2022.webp" alt="FUTAE KEEP"></div></a></div>`,
      'nanokona.html': `  <div class="col-md-3"><a href="skincare/nanokona.html"><p>パウダー美容液 ナノコナ</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_nanokona.webp" alt="パウダー美容液 ナノコナ"></div></a></div>`,
      'nanokona_plus.html': `  <div class="col-md-3"><a href="skincare/nanokona_plus.html"><p>ナノコナPLUS</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_nanokona_plus.webp" alt="ナノコナPLUS"></div></a></div>`,
      'horei_night_cream.html': `  <div class="col-md-3"><a href="skincare/horei_night_cream.html"><p>ホーレィナイトクリーム</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_hnc.webp" alt="ホーレィナイトクリーム"></div></a></div>`,
      'itsukano_facemask.html': `  <div class="col-md-3"><a href="skincare/itsukano_facemask.html"><p>いつかのフェイスマスク</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_skincare_itsukano_fm.webp" alt="いつかのフェイスマスク"></div></a></div>`,
      'terastem.html': `  <div class="col-md-3"><a href="skincare/terastem.html"><p>テラステム</p><div class="img_wrap"><img src="../common/img_webp/item_skincare_terastem_all.webp" alt="テラステム"></div></a></div>`,
      'meraprotect.html': `  <div class="col-md-3"><a href="skincare/meraprotect.html"><p>メラプロテクト</p><div class="img_wrap"><img src="../common/img_webp/item_skincare_meraprotect.webp" alt="メラプロテクト"></div></a></div>`,
      'ultoge.html': `  <div class="col-md-3"><a href="skincare/ultoge.html"><p>ウルトゲ</p><div class="img_wrap"><img src="../common/img_webp/item_skincare_ultoge.webp" alt="ウルトゲ"></div></a></div>`,
    },
    supplement: {
      baseHtml: `<section id="supplement" class="menu"><h3>健康食品</h3>__REPLACE_PRODUCT_PLACEHOLDER__<section>`,
      'collagen.html': `  <div class="col-md-3"><a href="supplement/collagen.html"><p>超濃厚コラーゲン</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_collagen.webp" alt="超濃厚コラーゲン"></div></a></div>`,
      'honkikouso.html': `  <div class="col-md-3"><a href="supplement/honkikouso.html"><p>本気酵素</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_honkikouso.webp" alt="本気酵素"></div></a></div>`,
      'honkisuiso.html': `  <div class="col-md-3"><a href="supplement/honkisuiso.html"><p>本気水素</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_honkisuiso.webp" alt="本気水素"></div></a></div>`,
      'kangensuiso.html': `  <div class="col-md-3"><a href="supplement/kangensuiso.html"><p>かんげんタブレット</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_kangentab.webp" alt="かんげんタブレット"></div></a></div>`,
      'shoukakouso.html': `  <div class="col-md-3"><a href="supplement/shoukakouso.html"><p>昇華酵素</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_shoukakouso.webp" alt="昇華酵素"></div></a></div>`,
      'blackginger.html': `  <div class="col-md-3"><a href="supplement/blackginger.html"><p>ブラックジンジャーカプセル</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_bgc.webp" alt="ブラックジンジャーカプセル"></div></a></div>`,
      'iqmo_capsules.html': `  <div class="col-md-3"><a href="supplement/iqmo_capsules.html"><p>イクモカプセル</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_supplement_iqmo_c.webp" alt="イクモカプセル"></div></a></div>`,
    },
    mozu: {
      baseHtml: `<section id="mozu" class="menu"><h3>もずの魔法シリーズ</h3>__REPLACE_PRODUCT_PLACEHOLDER__<section>`,
      'mozu_soap.html': `  <div class="col-md-3"><a href="mozu/mozu_soap.html"><p>もずの魔法石鹸</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_mozu_soap.webp" alt="もずの魔法石鹸"></div></a></div>`,
      'mozu_lotion.html': `  <div class="col-md-3"><a href="mozu/mozu_lotion.html"><p>もずの魔法ローション</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_mozu_lotion_500.webp" alt="もずの魔法ローション"></div></a></div>`,
      'mozu_shampoo.html': `  <div class="col-md-3"><a href="mozu/mozu_shampoo.html"><p>もずの魔法シャンプー</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_mozu_shampoo.webp" alt="もずの魔法シャンプー"></div></a></div>`,
    },
    gs_tea: {
      baseHtml: `<section id="gstea" class="menu"><h3>セイロン紅茶</h3>__REPLACE_PRODUCT_PLACEHOLDER__<section>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst001"><p>木製ボックス付き ロイヤルコレクション</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst001.webp" alt="木製ボックス付き ロイヤルコレクション"></div></a></div>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst002"><p>クイーンズチョイス</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst002.webp" alt="クイーンズチョイス"></div></a></div>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst003"><p>ロイヤルディライト</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst003.webp" alt="ロイヤルディライト"></div></a></div>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst004"><p>ヴィンテージアールグレイ</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst004.webp" alt="ヴィンテージアールグレイ"></div></a></div>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst005"><p>イングリッシュブレックファスト</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst005.webp" alt="イングリッシュブレックファスト"></div></a></div>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst006"><p>フルーツミックス</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst006.webp" alt="フルーツミックス"></div></a></div>`,
      'index.html': `  <div class="col-md-3"><a href="gs_tea/index.html#gst007"><p>ロイヤルコレクション（5種類各4包ずつ）</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_gstea_gst007.webp" alt="ロイヤルコレクション（5種類各4包ずつ）"></div></a></div>`,
    },
    others: {
      baseHtml: `<section id="others" class="menu"><h3>日用品・その他</h3>__REPLACE_PRODUCT_PLACEHOLDER__<section>`,
      'enso.html': `  <div class="col-md-3"><a href="others/enso.html"><p>次亜塩素酸水</p><div class="img_wrap"><img loading="lazy" src="../common/img_webp/item_others_enso_300.webp" alt="次亜塩素酸水"></div></a></div>`,
    },
  };
  constructor({ webManagerModel, logger, commonHelpers }) {
    this.webManagerModel = webManagerModel;
    this.logger = logger;
    this.commonHelpers = commonHelpers;
  }

  async generateNavHtml(categorizedProducts, tempDir) {
    try {
      const navHtmlContent = Object.entries(categorizedProducts)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([category, _]) => {
          return this.navCategories[category];
        })
        .join('');

      const navHtmlTemplatePath = path.join(
        __dirname,
        '../../../../../htmlTemplates/html-css_source_file/inc/nav.html'
      );

      const navHtmlOutputPath = path.join(tempDir, '/inc/nav.html');

      let navHtmlTemplate = fs.readFileSync(navHtmlTemplatePath, 'utf-8');
      navHtmlTemplate = navHtmlTemplate.replace(
        /<!-- NAV_PLACEHOLDER -->/,
        navHtmlContent
      );

      fs.writeFileSync(navHtmlOutputPath, navHtmlTemplate, 'utf-8');
    } catch (error) {
      this.logger.error('Error generating navigation HTML:', error);
      throw error;
    }
  }

  async generateProductHtml(categorizedProducts, tempDir, salonCode) {
    try {
      for (const [category, products] of Object.entries(categorizedProducts)) {
        products.forEach((product) => {
          const decryptedProductId = this.commonHelpers.decrypt(
            product.productId
          );
          let productHtmlContent = '';

          const generateProductSection = (
            pcode,
            namePrefix = '',
            productPrice
          ) => `
            <section class="cvarea row">
              <div class="col-md-5">
                <img loading="lazy" src="${product.images}" alt="${product.name}">
              </div>
              <div class="col-md-7">
                <p>${product.detailedName}</p>
                <h2>${namePrefix}${product.name} 《${pcode}》</h2>
                <hr>
                <div class="row price_wrap">
                  <div class="col-md-5 normal_price"></div>
                  <div class="col-md-1"></div>
                  <div class="col-md-6 special_price">
                    <p>販売価格<span class="price">${productPrice}</span>円<span class="pc"></span> (税込) </p>
                    <p class="icon_free">送料無料</p>
                  </div>
                </div>
                <div class="btn_wrap">
                  <a class="btn btn-success btn-lg btn-block" href="https://shop.armada-style.com/cart/add.php?pcode=${pcode}&code=${pcode}" target="_blank">カートに入れる</a>
                </div>
              </div>
            </section>
          `;

          if (product.hasRegularSales) {
            const regularPcode = `${salonCode}_${decryptedProductId}_system`;
            productHtmlContent += generateProductSection(
              regularPcode,
              '',
              product.sellingPrice
            );
          }

          if (product.isSubscribed) {
            const subscribedPcode = `${salonCode}_${decryptedProductId}_system_t`;
            productHtmlContent += generateProductSection(
              subscribedPcode,
              '【定期購入】',
              this.commonHelpers.calculateProductPrice(product)
            );
          }

          const htmlTemplateFolder = path.join(
            __dirname,
            '../../../../../htmlTemplates/html-css_source_file',
            category
          );
          const productHtmlPath = path.join(
            htmlTemplateFolder,
            product.htmlFileName
          );
          let productHtml = fs.readFileSync(productHtmlPath, 'utf8');

          // Replace the placeholder with generated product HTML
          productHtml = productHtml.replace(
            /<!--PRODUCT_PLACEHOLDER-->/,
            productHtmlContent
          );

          // Save the generated HTML to the temp directory
          const tempProductHtmlPath = path.join(
            tempDir,
            category,
            product.htmlFileName
          );
          fs.mkdirSync(path.dirname(tempProductHtmlPath), { recursive: true });
          fs.writeFileSync(tempProductHtmlPath, productHtml, 'utf8');
        });
      }
    } catch (error) {
      this.logger.error('Error generating product HTML:', error);
      throw error;
    }
  }
  /*
    Deploy To Ftp service
    @requestData request body data
    @requestHeader request header data
    */
  async generateIndexHtml(
    productCategories,
    categorizedProducts,
    templateConfig
  ) {
    try {
      const { shop_name } = templateConfig;
      let indexHtmlMainContent = '';

      // カテゴリーリストの生成
      let categoriesListHtml = '';
      for (const category of productCategories) {
        categoriesListHtml += this.mainCategories[category] || '';
      }

      // メインセクションの追加
      indexHtmlMainContent += `<section class="menu_category"><h2>取扱商品</h2><div class="row">${categoriesListHtml}</div></section>`;

      // 商品一覧をカテゴリごとに追加
      Object.entries(categorizedProducts)
        .sort(([a], [b]) => b.localeCompare(a))
        .forEach(([category, products]) => {
          const subCategory = this.subCategories[category];
          let subCategoryContent = '';
          if (subCategory) {
            for (const product of products) {
              if (product.htmlFileName && subCategory[product.htmlFileName]) {
                subCategoryContent += subCategory[product.htmlFileName];
              }
            }
          }
          const categorySection = subCategory.baseHtml.replace(
            /__REPLACE_PRODUCT_PLACEHOLDER__/,
            `<div class="row">${subCategoryContent}</div>`
          );
          indexHtmlMainContent += categorySection;
        });

      // テンプレートの読み込みと更新
      const htmlTemplateFolder = path.join(
        __dirname,
        '../../../../../htmlTemplates/html-css_source_file'
      );
      const indexHtmlPath = path.join(htmlTemplateFolder, 'index.html');
      let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

      // メインコンテンツ、タイトル、住所の置換
      indexHtmlContent = indexHtmlContent
        .replace(/<!-- CATEGORY_PLACEHOLDER -->/s, indexHtmlMainContent)
        .replace(/ <!-- TITLE_PLACEHOLDER -->/, `<title>${shop_name}</title>`);

      return indexHtmlContent;
    } catch (error) {
      this.logger.error('Error generating index HTML:', error);
      throw error;
    }
  }

  async deployToFtp(requestDataArray, requestHeader, reqUser) {
    try {
      const decryptedUserId = this.commonHelpers.decrypt(reqUser.user_id);
      const salonCode = reqUser.salon_code;

      // サロン情報の設定
      const templateConfig = {
        shop_id: 'test_salon_code',
        shop_name: 'New Salon',
        shop_address: 'Tokyo, Japan',
      };

      // 商品データの取得
      const currentProducts = await this.webManagerModel.fetchUploadProducts(
        decryptedUserId
      );

      if (currentProducts.length === 0) {
        return await this.commonHelpers.prepareResponse(
          StatusCodes.OK,
          'SUCCESS'
        );
      }

      // カテゴリーの抽出
      const productCategories = Array.from(
        new Set(currentProducts.map((product) => product.productCategory))
      ).sort((a, b) => b.localeCompare(a));

      console.log(productCategories);

      // 商品のカテゴリー別分類
      const categorizedProducts = currentProducts.reduce((acc, product) => {
        if (!acc[product.productCategory]) {
          acc[product.productCategory] = [];
        }
        acc[product.productCategory].push(product);
        return acc;
      }, {});

      // テンプレートフォルダのパス設定
      const htmlTemplateFolder = path.join(
        __dirname,
        '../../../../../htmlTemplates/html-css_source_file'
      );

      // 一時ディレクトリの作成
      const tempDir = `/tmp/${templateConfig.shop_id}/${moment().valueOf()}/`;
      fs.mkdirSync(tempDir, { recursive: true });

      // テンプレートファイルのコピー
      const filesToCopy = [
        'inc',
        'commerce.html',
        'index.html',
        'privacy.html',
        'question.html',
      ];
      filesToCopy.forEach((file) => {
        const srcPath = path.join(htmlTemplateFolder, file);
        const destPath = path.join(tempDir, file);
        if (fs.lstatSync(srcPath).isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          fs.readdirSync(srcPath).forEach((subFile) => {
            fs.copyFileSync(
              path.join(srcPath, subFile),
              path.join(destPath, subFile)
            );
          });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });

      // index.htmlの生成と保存
      const indexHtmlContent = await this.generateIndexHtml(
        productCategories,
        categorizedProducts,
        templateConfig
      );
      fs.writeFileSync(
        path.join(tempDir, 'index.html'),
        indexHtmlContent,
        'utf8'
      );

      await this.generateProductHtml(categorizedProducts, tempDir, salonCode);
      await this.generateNavHtml(categorizedProducts, tempDir);

      // FTP設定とアップロード
      const ftpConfig = {
        host: process.env.FTP_HOST_DEV,
        user: process.env.FTP_USER_DEV,
        password: process.env.FTP_PASSWORD_DEV,
        secure: true,
      };

      const client = new ftp.Client();
      client.ftp.verbose = true;

      await client.access(ftpConfig);

      const remoteShopFolder = `/shop/${templateConfig.shop_id}`;

      // 既存のファイルを削除
      // await client.clearWorkingDir(remoteShopFolder);

      // 新しいファイルをアップロード
      await client.uploadFromDir(tempDir, remoteShopFolder).then(() => {});

      client.close();

      // 一時ディレクトリの削除
      fs.rmSync(tempDir, { recursive: true, force: true });

      return await this.commonHelpers.prepareResponse(
        StatusCodes.OK,
        'SUCCESS'
      );
    } catch (error) {
      this.logger.error('Deploy error:', error);
      throw error;
    }
  }
}

module.exports = webManagerService;
