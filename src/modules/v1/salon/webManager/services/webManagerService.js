import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import tableConstants from '~/constants/tableConstants';
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

class webManagerService {
  mainCategories = {
    haircare: `<div class="col-md-4"><a href="#haircare"><p>ヘアケア</p><div class="img_wrap"><img src="../common/img_webp/category_haircare.webp" alt="ヘアケア"></div></a></div>`,
    skincare: `<div class="col-md-4"><a href="#skincare"><p>スキンケア・洗顔</p><div class="img_wrap"><img src="../common/img_webp/category_skincare.webp" alt="スキンケア・洗顔"></div></a></div>`,
    supplement: `<div class="col-md-4"><a href="#supplement"><p>健康食品</p><div class="img_wrap"><img src="../common/img_webp/category_supplement.webp" alt="健康食品"></div></a></div>`,
    mozu: `<div class="col-md-4"><a href="#mozu"><p>もずの魔法シリーズ</p><div class="img_wrap"><img src="../common/img_webp/category_mozu.webp" alt="もずの魔法シリーズ"></div></a></div>`,
    gstea: `<div class="col-md-4"><a href="#gstea"><p>セイロン（スリランカ）紅茶</p><div class="img_wrap"><img src="../common/img_webp/category_gstea.webp" alt="セイロン（スリランカ）紅茶"></div></a></div>`,
    others: `<div class="col-md-4"><a href="#others"><p>日用品・その他</p><div class="img_wrap"><img src="../common/img_webp/category_others.webp" alt="日用品・その他"></div></a></div>`,
  };

  subCategories = {
    haircare: {
      baseHtml: `<section id="haircare" class="menu"><h3>ヘアケア</h3><div class="row"></div><section>`,
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
  };
  constructor({ webManagerModel, logger, commonHelpers, ProductModel }) {
    this.webManagerModel = webManagerModel;
    this.logger = logger;
    this.commonHelpers = commonHelpers;
    this.ProductModel = ProductModel;
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
      const { shop_name, shop_address } = templateConfig;
      let indexHtmlMainContent = '';

      // カテゴリーリストの生成
      let categoriesListHtml = '';
      for (const category of productCategories) {
        categoriesListHtml += this.mainCategories[category] || '';
      }

      // メインセクションの追加
      indexHtmlMainContent += `<section class="menu_category"><h2>取扱商品</h2><div class="row">${categoriesListHtml}</div></section>`;

      // 商品一覧をカテゴリごとに追加
      for (const [category, products] of Object.entries(categorizedProducts)) {
        const subCategory = this.subCategories[category];
        if (subCategory) {
          let subCategoryContent = '';
          for (const product of products) {
            if (product.htmlFileName && subCategory[product.htmlFileName]) {
              subCategoryContent += subCategory[product.htmlFileName];
            }
          }

          const categorySection = subCategory.baseHtml.replace(
            /<div class="row">.*<\/div>/,
            `<div class="row">${subCategoryContent}</div>`
          );
          indexHtmlMainContent += categorySection;
        }
      }

      // テンプレートの読み込みと更新
      const htmlTemplateFolder = path.join(
        __dirname,
        '../../../../../htmlTemplates/html-css_source_file'
      );
      const indexHtmlPath = path.join(htmlTemplateFolder, 'index.html');
      let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

      // メインコンテンツ、タイトル、住所の置換
      indexHtmlContent = indexHtmlContent
        .replace(
          /<main id="index">.*<\/main>/s,
          `<main id="index">${indexHtmlMainContent}</main>`
        )
        .replace(/<title>.*<\/title>/, `<title>${shop_name}</title>`)
        .replace(
          /<p id="address">.*<\/p>/,
          `<p id="address">${shop_address}</p>`
        );

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
        shop_id: salonCode,
        shop_name: 'New Salon',
        shop_address: 'Tokyo, Japan',
      };

      // 商品データの取得
      const currentProducts = await this.webManagerModel.fetchUploadProducts({
        salonId: decryptedUserId,
      });

      // カテゴリーの抽出
      const productCategories = new Set(
        currentProducts.map((product) => product.productCategory)
      );

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
      this.copyTemplateFiles(htmlTemplateFolder, tempDir);

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

      const remoteShopFolder = `/home/silvermole7/www/${templateConfig.shop_id}`;
      await client.ensureDir(remoteShopFolder);
      await client.uploadFromDir(tempDir, remoteShopFolder);

      await client.close();

      // 一時ディレクトリの削除
      fs.rmSync(tempDir, { recursive: true, force: true });

      return true;
    } catch (error) {
      this.logger.error('Deploy error:', error);
      throw error;
    }
  }

  copyTemplateFiles(sourceDir, targetDir) {
    const files = fs.readdirSync(sourceDir);

    files.forEach((file) => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        fs.mkdirSync(targetPath, { recursive: true });
        this.copyTemplateFiles(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }
}

module.exports = webManagerService;
