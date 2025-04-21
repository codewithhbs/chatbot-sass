const { validationResult } = require('express-validator');
const Website = require('../models/Website.Schema');
const axios = require('axios');
const cheerio = require('cheerio');
const ServicesSchema = require('../models/Services.Schema');
const generateMetaCode = () => {
    const rand = () => Math.random().toString(36).substring(2, 7).toUpperCase();
    return `chatbot-${rand()}-${rand()}`;
};

const generateWebsiteId = async () => {
    let unique = false;
    let websiteId = '';

    while (!unique) {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        websiteId = `WEBC${randomNum}`;

        const exists = await Website.findOne({ website_id: websiteId });
        if (!exists) {
            unique = true;
        }
    }

    return websiteId;
};

exports.websiteSchemaEnter = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(401).json({ message: 'Please Make a login First' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { website_name, url, logo, info } = req.body;

    console.log(req.body)

    try {
        const website_id = await generateWebsiteId();
        const metaCode = generateMetaCode();

        const newWebsite = new Website({
            website_name,
            website_id,
            url,
            logo: logo || '',
            info: {
                description: info?.description || '',
                contactNumber: info?.contactNumber || '',
                address: info?.address || '',
                timings: {
                    open: info?.timings?.open || '',
                    close: info?.timings?.close || ''
                },

                social_links: {
                    insta: info?.social_links?.insta || '',
                    fb: info?.social_links?.fb || '',
                    youtube: info?.social_links?.youtube || ''
                }
            },
            userId: user.id,
            metaCode
        });

        await newWebsite.save();

        res.status(201).json({
            message: 'Website registered successfully!',
            website_id,
            metaCode
        });

    } catch (error) {
        console.error('Website creation error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.checkMetaCode = async (req, res) => {
    try {
        const { url, metaCode } = req.body;


        if (!url || !metaCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both the website URL and the expected verification code.'
            });
        }


        const websiteRecord = await Website.findOne({ url, metaCode });

        if (!websiteRecord) {
            return res.status(404).json({
                success: false,
                message: 'No matching website found with the provided URL and verification code.'
            });
        }


        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const metaTag = $('meta[name="chatbot-verification"]').attr('content');


        if (metaTag === metaCode) {
            websiteRecord.metaCodeVerify = true;
            await websiteRecord.save();
            return res.status(200).json({
                success: true,
                message: '✅ Verification successful! Your chatbot verification meta tag is correctly placed.'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: '⚠️ Verification failed. The meta tag exists but the code does not match. Please double-check the value.'
            });
        }
    } catch (error) {
        console.error('Error during meta code check:', error);
        return res.status(500).json({
            success: false,
            message: '🚫 Unable to access the website or verify the meta tag. Please make sure the URL is correct and publicly accessible.',
            error: error.message
        });
    }
};



exports.get_my_chatBots = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(401).json({ message: 'Please Make a login First' });
    }
    try {
        const websites = await Website.find({ userId: user.id });
        res.status(200).json(websites);
    } catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.getMyChatBotDetailsBymetaCode = async (req, res) => {
    const { metaCode } = req.query;
    if (!metaCode) {
        return res.status(400).json({ message: 'Meta code is required' });
    }

    try {
        const website = await Website.findOne({ metaCode }).populate('userId');
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }
        res.status(200).json(website);
    } catch (error) {
        console.error('Error fetching website:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.deleteChatBot = async (req, res) => {
    try {
        const { id } = req.params;

       
        const website = await Website.findById(id);
        if (!website) {
            return res.status(404).json({ message: 'Website not found' });
        }

        
        await ServicesSchema.deleteMany({ metaCode: website.metaCode });

     
        await Website.findByIdAndDelete(id);

        res.status(200).json({ message: 'Website and related services deleted successfully' });

    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
