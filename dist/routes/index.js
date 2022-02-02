"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_1 = require("./social");
const router = (0, express_1.Router)();
router.get('/callback/github', social_1.githubCallback, social_1.socialCallback);
router.get('/redirect/:provider', social_1.socialRedirect);
router.post('/register', social_1.socialRegister);
exports.default = router;
