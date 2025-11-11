// StudySave 应用主逻辑
class StudySaveApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.userData = {};
        this.currentVerificationCode = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserData();
        // 初始化隐私与位置默认值
        if (!this.userData.privacy) {
            this.userData.privacy = {
                allowPlans: true,
                allowLikes: false,
                allowFavorites: false,
                allowFindById: false,
            };
        }
        if (!this.userData.location) {
            this.userData.location = { country: '', province: '', address: '' };
        }
        // 初始化主题默认值并应用
        if (!this.userData.theme) {
            this.userData.theme = 'dark';
            this.saveUserData();
        }
        this.applyTheme();
        this.updateSettingsForm();
        // 固定账号ID：首次初始化生成并保存
        if (!this.userData.accountId) {
            this.userData.accountId = this.generateAccountId();
            this.saveUserData();
        }
        const totalStepsEl = document.getElementById('totalSteps');
        if (totalStepsEl) totalStepsEl.textContent = this.totalSteps;
        this.updateAvatarUI();
    }

    // 事件绑定
    bindEvents() {
        // 登录页面事件
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });

        // 忘记密码入口
        const forgotLink = document.getElementById('forgotPasswordLink');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('resetPasswordPage');
            });
        }

        // 注册页面事件
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        document.getElementById('sendCodeBtn').addEventListener('click', () => {
            this.sendVerificationCode();
        });

        // 引导页面事件
        document.getElementById('nextStep').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStep').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('finishOnboarding').addEventListener('click', () => {
            this.finishOnboarding();
        });

        // 主面板事件（头部设置按钮可能不存在，做兼容）
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showPage('settingsPage');
            });
        }

        // 头像点击跳转个人信息
        const avatarBtn = document.getElementById('avatarBtn');
        if (avatarBtn) {
            avatarBtn.addEventListener('click', () => {
                this.showPage('profilePage');
            });
        }

        // 设置页面事件
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettingsSave();
        });

        document.getElementById('backToDashboard').addEventListener('click', () => {
            this.showPage('dashboardPage');
        });

        document.getElementById('cancelSettings').addEventListener('click', () => {
            this.showPage('dashboardPage');
        });

        // 首页热门方案查看
        document.querySelectorAll('.viewPlanBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.dataset.plan || 'popular';
                this.showNotification(`“${plan}”方案详情即将上线`, 'info');
            });
        });
        const openPlansExplore = document.getElementById('openPlansExplore');
        if (openPlansExplore) {
            openPlansExplore.addEventListener('click', () => this.showPage('plansExplorePage'));
        }
        const backToDashboardFromPlans = document.getElementById('backToDashboardFromPlans');
        if (backToDashboardFromPlans) {
            backToDashboardFromPlans.addEventListener('click', () => this.showPage('dashboardPage'));
        }

        // 隐私设置开关
        const privacyMap = [
            { id: 'privacyAllowPlans', key: 'allowPlans' },
            { id: 'privacyAllowLikes', key: 'allowLikes' },
            { id: 'privacyAllowFavorites', key: 'allowFavorites' },
            { id: 'privacyAllowFindById', key: 'allowFindById' },
        ];
        privacyMap.forEach(({ id, key }) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    if (!this.userData.privacy) this.userData.privacy = {};
                    this.userData.privacy[key] = el.checked;
                    this.saveUserData();
                });
            }
        });

        // 位置编辑入口与表单
        const editLocation = document.getElementById('editLocation');
        if (editLocation) {
            editLocation.addEventListener('click', () => {
                this.showPage('locationEditPage');
                this.updateLocationForm();
            });
        }
        const backToSettingsFromLocation = document.getElementById('backToSettingsFromLocation');
        if (backToSettingsFromLocation) {
            backToSettingsFromLocation.addEventListener('click', () => this.showPage('settingsPage'));
        }
        const cancelLocation = document.getElementById('cancelLocation');
        if (cancelLocation) {
            cancelLocation.addEventListener('click', () => this.showPage('settingsPage'));
        }
        const locationForm = document.getElementById('locationForm');
        if (locationForm) {
            locationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const country = document.getElementById('locationCountry').value.trim();
                const province = document.getElementById('locationProvince').value.trim();
                const address = document.getElementById('locationAddress').value.trim();
                this.userData.location = { country, province, address };
                this.saveUserData();
                this.updateSettingsForm();
                this.showNotification('位置已保存', 'success');
                this.showPage('settingsPage');
            });
        }

        // 重置密码页面事件
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleResetPassword();
            });
        }

        const backToLoginFromReset = document.getElementById('backToLoginFromReset');
        if (backToLoginFromReset) {
            backToLoginFromReset.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('loginPage');
            });
        }

        const resetSendCodeBtn = document.getElementById('resetSendCodeBtn');
        if (resetSendCodeBtn) {
            resetSendCodeBtn.addEventListener('click', () => {
                this.sendResetVerificationCode();
            });
        }

        // 个人信息编辑页事件
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileSave();
            });
        }
        const profileAvatarInput = document.getElementById('profileAvatar');
        if (profileAvatarInput) {
            profileAvatarInput.addEventListener('change', (e) => {
                this.previewAvatarFile(e.target.files[0]);
            });
        }
        const backToDashboardFromProfile = document.getElementById('backToDashboardFromProfile');
        if (backToDashboardFromProfile) {
            backToDashboardFromProfile.addEventListener('click', () => {
                this.showPage('dashboardPage');
            });
        }

        // 底部按钮
        const planBtn = document.getElementById('planBtn');
        if (planBtn) {
            planBtn.addEventListener('click', () => {
                this.showPage('plansExplorePage');
            });
        }
        const communityBtn = document.getElementById('communityBtn');
        if (communityBtn) {
            communityBtn.addEventListener('click', () => {
                this.showPage('communityPage');
            });
        }
        const matchBtn = document.getElementById('matchBtn');
        if (matchBtn) {
            matchBtn.addEventListener('click', () => {
                this.showPage('matchPage');
            });
        }
        const myBtn = document.getElementById('myBtn');
        if (myBtn) {
            myBtn.addEventListener('click', () => {
                this.showPage('plansExplorePage');
            });
        }
        const myRealBtn = document.getElementById('myRealBtn');
        if (myRealBtn) {
            myRealBtn.addEventListener('click', () => {
                this.showPage('myPage');
            });
        }

        // 主题选择事件
        const themeLight = document.getElementById('themeLight');
        const themeDark = document.getElementById('themeDark');
        if (themeLight) {
            themeLight.addEventListener('change', () => {
                if (themeLight.checked) {
                    this.userData.theme = 'light';
                    this.applyTheme();
                    this.saveUserData();
                }
            });
        }
        if (themeDark) {
            themeDark.addEventListener('change', () => {
                if (themeDark.checked) {
                    this.userData.theme = 'dark';
                    this.applyTheme();
                    this.saveUserData();
                }
            });
        }

        // 搜索功能
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const keyword = searchInput.value.trim();
                if (!keyword) {
                    this.showNotification('请输入搜索关键词', 'info');
                    return;
                }
                this.userData.lastSearch = keyword;
                this.saveUserData();
                this.showNotification(`搜索 “${keyword}” 功能即将上线`, 'info');
            });
            // 回车触发搜索
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchBtn.click();
                }
            });
        }

        // 首页问卷入口按钮
        const openSurveyBtn = document.getElementById('openSurveyBtn');
        if (openSurveyBtn) {
            openSurveyBtn.addEventListener('click', () => {
                this.showPage('onboardingPage');
            });
        }

        // 社群与匹配页面返回与占位交互
        const backToDashboardFromCommunity = document.getElementById('backToDashboardFromCommunity');
        if (backToDashboardFromCommunity) {
            backToDashboardFromCommunity.addEventListener('click', () => {
                this.showPage('dashboardPage');
            });
        }
        const createGroupBtn = document.getElementById('createGroupBtn');
        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => {
                this.showNotification('群聊创建功能即将上线', 'info');
            });
        }
        const inviteMembersBtn = document.getElementById('inviteMembersBtn');
        if (inviteMembersBtn) {
            inviteMembersBtn.addEventListener('click', () => {
                this.showNotification('邀请成员功能即将上线', 'info');
            });
        }
        const backToDashboardFromMatch = document.getElementById('backToDashboardFromMatch');
        if (backToDashboardFromMatch) {
            backToDashboardFromMatch.addEventListener('click', () => {
                this.showPage('dashboardPage');
            });
        }

        // 我的页面交互（返回与四个入口）
        const backToDashboardFromMy = document.getElementById('backToDashboardFromMy');
        if (backToDashboardFromMy) {
            backToDashboardFromMy.addEventListener('click', () => {
                this.showPage('dashboardPage');
            });
        }
        const myLikes = document.getElementById('myLikes');
        if (myLikes) {
            myLikes.addEventListener('click', () => this.showNotification('喜欢功能即将上线', 'info'));
        }
        const myFavorites = document.getElementById('myFavorites');
        if (myFavorites) {
            myFavorites.addEventListener('click', () => this.showNotification('收藏功能即将上线', 'info'));
        }
        const mySupport = document.getElementById('mySupport');
        if (mySupport) {
            mySupport.addEventListener('click', () => this.showNotification('客服功能即将上线', 'info'));
        }
        const mySavings = document.getElementById('mySavings');
        if (mySavings) {
            mySavings.addEventListener('click', () => this.showNotification('每月省钱功能即将上线', 'info'));
        }

        // “我的”页：设置入口
        const mySettings = document.getElementById('mySettings');
        if (mySettings) {
            mySettings.addEventListener('click', () => this.showPage('settingsPage'));
        }

        // 主页编辑入口（我的页）
        const editBirthday = document.getElementById('editBirthday');
        [editBirthday].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showPage('myEditPage');
                    this.updateMyEditForm();
                    // 聚焦对应输入
                    const map = {
                        editBirthday: 'editBirthdayInput'
                    };
                    const targetId = map[btn.id];
                    const targetInput = document.getElementById(targetId);
                    if (targetInput) targetInput.focus();
                });
            }
        });

        // 我的信息编辑页面事件
        const myEditForm = document.getElementById('myEditForm');
        if (myEditForm) {
            myEditForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const birthday = document.getElementById('editBirthdayInput').value;
                this.userData.birthday = birthday || '';
                this.saveUserData();
                this.showNotification('主页信息已保存', 'success');
                this.showPage('myPage');
                this.updateMyPageView();
            });
        }
        const cancelMyEdit = document.getElementById('cancelMyEdit');
        if (cancelMyEdit) {
            cancelMyEdit.addEventListener('click', () => {
                this.showPage('myPage');
            });
        }
        const backToMyPageFromEdit = document.getElementById('backToMyPageFromEdit');
        if (backToMyPageFromEdit) {
            backToMyPageFromEdit.addEventListener('click', () => {
                this.showPage('myPage');
            });
        }

        // 表单输入事件（实时保存）
        this.bindFormInputs();
    }

    // 注册处理
    handleRegister() {
        const email = document.getElementById('registerEmail').value;
        const code = document.getElementById('verificationCode').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 验证输入
        if (!email || !code || !password || !confirmPassword) {
            alert('请填写完整的注册信息');
            return;
        }

        if (password.length < 6) {
            alert('密码长度至少为6位');
            return;
        }

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        // 验证验证码（模拟）
        if (!this.validateVerificationCode(code)) {
            alert('验证码错误，请重新输入');
            return;
        }

        // 注册成功
        this.userData.email = email;
        this.userData.password = password; // 注意：实际应用中应该加密存储
        this.saveUserData();
        
        alert('注册成功！请完善您的个人信息');
        this.showPage('onboardingPage');
    }

    // 发送验证码
    sendVerificationCode() {
        const email = document.getElementById('registerEmail').value;
        const sendBtn = document.getElementById('sendCodeBtn');

        if (!email) {
            alert('请先输入邮箱地址');
            return;
        }

        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('请输入有效的邮箱地址');
            return;
        }

        // 模拟发送验证码
        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';
        
        // 生成6位验证码（实际应用中应该通过后端发送）
        this.currentVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        setTimeout(() => {
            alert(`验证码已发送到 ${email}\n模拟验证码：${this.currentVerificationCode}`);
            this.startCountdown(sendBtn);
        }, 1500);
    }

    // 验证码倒计时
    startCountdown(button) {
        let countdown = 60;
        const originalText = button.textContent;
        
        const timer = setInterval(() => {
            countdown--;
            button.textContent = `${countdown}秒后重试`;
            
            if (countdown <= 0) {
                clearInterval(timer);
                button.disabled = false;
                button.textContent = originalText;
            }
        }, 1000);
    }

    // 验证验证码
    validateVerificationCode(code) {
        return code === this.currentVerificationCode;
    }

    // 发送重置密码验证码
    sendResetVerificationCode() {
        const email = document.getElementById('resetEmail').value;
        const sendBtn = document.getElementById('resetSendCodeBtn');

        if (!email) {
            alert('请先输入邮箱地址');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('请输入有效的邮箱地址');
            return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';

        // 生成验证码并模拟发送
        this.currentVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        setTimeout(() => {
            alert(`验证码已发送到 ${email}\n模拟验证码：${this.currentVerificationCode}`);
            this.startCountdown(sendBtn);
        }, 1500);
    }

    // 重置密码处理
    handleResetPassword() {
        const email = document.getElementById('resetEmail').value;
        const code = document.getElementById('resetCode').value;
        const newPassword = document.getElementById('resetNewPassword').value;
        const confirmNewPassword = document.getElementById('resetConfirmPassword').value;

        if (!email || !code || !newPassword || !confirmNewPassword) {
            alert('请填写完整的重置信息');
            return;
        }

        if (newPassword.length < 6) {
            alert('新密码长度至少为6位');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('两次输入的新密码不一致');
            return;
        }

        if (!this.validateVerificationCode(code)) {
            alert('验证码错误，请重新输入');
            return;
        }

        // 模拟重置成功：更新用户密码并返回登录页
        this.userData.email = email;
        this.userData.password = newPassword;
        this.saveUserData();
        alert('密码重置成功，请使用新密码登录');
        this.showPage('loginPage');
    }

    // 绑定表单输入事件
    bindFormInputs() {
        // 引导页面表单
        const onboardingInputs = document.querySelectorAll('#onboardingPage input, #onboardingPage select');
        onboardingInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.userData[e.target.name] = e.target.value;
                this.saveUserData();
            });
        });

        // 设置页面表单
        const settingsInputs = document.querySelectorAll('#settingsPage input, #settingsPage select');
        settingsInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.userData[e.target.name] = e.target.value;
                this.saveUserData();
            });
        });
    }

    // 页面切换
    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示目标页面
        document.getElementById(pageId).classList.add('active');

        // 页面特定逻辑
        if (pageId === 'dashboardPage') {
            this.updateDashboard();
        } else if (pageId === 'settingsPage') {
            this.updateSettingsForm();
        } else if (pageId === 'myPage') {
            this.updateMyPageView();
        } else if (pageId === 'myEditPage') {
            this.updateMyEditForm();
        } else if (pageId === 'locationEditPage') {
            this.updateLocationForm();
        }
    }

    // 我的页：更新显示主页信息
    updateMyPageView() {
        const idEl = document.getElementById('viewAccountId');
        const birthdayEl = document.getElementById('viewBirthday');
        if (idEl) idEl.textContent = (this.userData.accountId && this.userData.accountId.trim()) ? this.userData.accountId.trim() : '未设置';
        if (birthdayEl) birthdayEl.textContent = (this.userData.birthday) ? this.userData.birthday : '未设置';
    }

    // 我的信息编辑页：表单初始化
    updateMyEditForm() {
        const birthdayInput = document.getElementById('editBirthdayInput');
        if (birthdayInput) birthdayInput.value = this.userData.birthday || '';
    }

    // 生成固定账号ID
    generateAccountId() {
        const base = 'SS';
        const ts = Date.now().toString(36).slice(-6);
        const rand = Math.random().toString(36).slice(2, 6);
        return `${base}-${ts}${rand}`;
    }

    // 登录处理
    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('请填写完整的登录信息');
            return;
        }

        // 模拟登录验证
        this.userData.email = email;
        this.saveUserData();
        
        // 检查是否是首次登录
        if (!this.userData.hasCompletedOnboarding) {
            this.showPage('onboardingPage');
        } else {
            this.showPage('dashboardPage');
        }
    }

    // 引导页面步骤控制
    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    // 验证当前步骤
    validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (!input.value || (input.type === 'checkbox' && !input.checked)) {
                if (input.type === 'radio') {
                    const radioGroup = currentStepElement.querySelectorAll(`input[name="${input.name}"]`);
                    const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isChecked) {
                        alert('请完成当前步骤的选择');
                        return false;
                    }
                } else {
                    alert('请完成当前步骤的填写');
                    return false;
                }
            }
        }

        // 特殊验证：复选框组至少选择一个
        if (this.currentStep === 5) {
            const checkboxes = currentStepElement.querySelectorAll('input[type="checkbox"]');
            const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (!isChecked) {
                alert('请至少选择一种食物偏好');
                return false;
            }
        }

        return true;
    }

    // 更新步骤显示
    updateStepDisplay() {
        // 更新步骤指示器
        document.getElementById('currentStep').textContent = this.currentStep;
        
        // 更新进度条
        const progressFill = document.getElementById('progressFill');
        const progress = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${progress}%`;

        // 显示/隐藏步骤
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

        // 更新按钮状态
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const finishBtn = document.getElementById('finishOnboarding');

        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        
        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            finishBtn.style.display = 'none';
        }
    }

    // 完成引导
    finishOnboarding() {
        if (!this.validateCurrentStep()) {
            return;
        }

        // 收集所有引导数据
        this.collectOnboardingData();
        this.userData.hasCompletedOnboarding = true;
        this.saveUserData();
        
        alert('欢迎加入StudySave！为您生成个性化推荐...');
        this.showPage('dashboardPage');
    }

    // 收集引导数据
    collectOnboardingData() {
        const formData = new FormData(document.querySelector('#onboardingPage form'));
        
        // 处理多选框
        const foodPreferences = [];
        formData.getAll('foodPreference').forEach(pref => {
            foodPreferences.push(pref);
        });

        this.userData = {
            ...this.userData,
            country: formData.get('country'),
            budget: formData.get('budget'),
            city: formData.get('city'),
            gender: formData.get('gender'),
            mealPreference: formData.get('mealPreference'),
            foodPreferences: foodPreferences,
            calorieControl: formData.get('calorieControl')
        };
    }

    // 更新主面板
    updateDashboard() {
        const welcomeSection = document.querySelector('.welcome-section h2');
        const displayName = this.getDisplayName();
        welcomeSection.textContent = `欢迎回来，${displayName}！`;
        
        // 根据用户数据更新推荐卡片
        this.updateRecommendationCards();

        // 更新头像显示
        this.updateAvatarUI();
    }

    // 更新推荐卡片
    updateRecommendationCards() {
        const cards = document.querySelectorAll('.card');
        const budget = this.userData.budget;
        const foodPreferences = this.userData.foodPreferences || [];
        
        // 根据预算调整推荐
        if (budget === '500-800') {
            cards[1].style.display = 'block'; // 显示省钱攻略
        }
        
        // 根据食物偏好调整推荐
        if (foodPreferences.includes('vegetarian')) {
            // 为素食用户添加特殊推荐
            console.log('用户偏好素食，调整推荐内容');
        }
    }

    // 更新设置表单
    updateSettingsForm() {
        if (this.userData.email) {
            document.getElementById('settingsEmail').value = this.userData.email;
        }
        if (this.userData.budget) {
            document.getElementById('settingsBudget').value = this.userData.budget;
        }
        // 个人信息编辑页初始化
        const profileNameEl = document.getElementById('profileName');
        if (profileNameEl && this.userData.name) {
            profileNameEl.value = this.userData.name;
        }

        // 初始化隐私开关
        const p = this.userData.privacy || {};
        const setChecked = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.checked = !!value;
        };
        setChecked('privacyAllowPlans', p.allowPlans);
        setChecked('privacyAllowLikes', p.allowLikes);
        setChecked('privacyAllowFavorites', p.allowFavorites);
        setChecked('privacyAllowFindById', p.allowFindById);

        // 更新位置摘要
        const summaryEl = document.getElementById('locationSummary');
        if (summaryEl) {
            const { country, province, address } = this.userData.location || {};
            const parts = [country, province].filter(Boolean).join(' ');
            const tail = address ? ` · ${address}` : '';
            summaryEl.textContent = (parts || address) ? `${parts}${tail}` : '未设置';
        }

        // 初始化主题单选
        const theme = this.userData.theme || 'dark';
        const lightEl = document.getElementById('themeLight');
        const darkEl = document.getElementById('themeDark');
        if (lightEl) lightEl.checked = theme === 'light';
        if (darkEl) darkEl.checked = theme === 'dark';
    }

    // 位置表单初始化
    updateLocationForm() {
        const countryEl = document.getElementById('locationCountry');
        const provinceEl = document.getElementById('locationProvince');
        const addressEl = document.getElementById('locationAddress');
        if (!this.userData.location) this.userData.location = { country: '', province: '', address: '' };
        if (countryEl) countryEl.value = this.userData.location.country || '';
        if (provinceEl) provinceEl.value = this.userData.location.province || '';
        if (addressEl) addressEl.value = this.userData.location.address || '';
    }

    // 设置保存
    handleSettingsSave() {
        const email = document.getElementById('settingsEmail').value;
        const budget = document.getElementById('settingsBudget').value;

        this.userData.email = email;
        this.userData.budget = budget;
        this.saveUserData();

        alert('设置已保存！');
        this.showPage('dashboardPage');
    }

    // 本地存储
    saveUserData() {
        localStorage.setItem('studySaveUserData', JSON.stringify(this.userData));
    }

    loadUserData() {
        const saved = localStorage.getItem('studySaveUserData');
        if (saved) {
            this.userData = JSON.parse(saved);
        }
    }

    // 应用主题
    applyTheme() {
        const theme = this.userData.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }

    // 工具方法
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                       type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 头像 UI 更新
    updateAvatarUI() {
        const avatarEl = document.getElementById('avatarDisplay');
        if (!avatarEl) return;
        avatarEl.style.backgroundImage = '';
        avatarEl.textContent = '';
        if (this.userData.avatarUrl) {
            // 用背景图展示头像
            avatarEl.style.backgroundImage = `url('${this.userData.avatarUrl}')`;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.style.backgroundPosition = 'center';
        } else {
            // 显示首字母
            avatarEl.textContent = this.getInitialLetter();
            avatarEl.style.backgroundImage = 'none';
        }

        // 编辑页预览也同步
        const previewEl = document.getElementById('profileAvatarPreview');
        if (previewEl) {
            previewEl.style.backgroundImage = avatarEl.style.backgroundImage;
            previewEl.textContent = avatarEl.textContent;
            previewEl.style.backgroundSize = avatarEl.style.backgroundSize;
            previewEl.style.backgroundPosition = avatarEl.style.backgroundPosition;
        }
    }

    getDisplayName() {
        if (this.userData.name && this.userData.name.trim()) return this.userData.name.trim();
        const email = this.userData.email || '用户';
        return email.includes('@') ? email.split('@')[0] : email;
    }

    getInitialLetter() {
        const name = this.getDisplayName();
        return name.charAt(0).toUpperCase();
    }

    // 头像预览处理
    previewAvatarFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            const previewEl = document.getElementById('profileAvatarPreview');
            if (previewEl) {
                previewEl.style.backgroundImage = `url('${dataUrl}')`;
                previewEl.style.backgroundSize = 'cover';
                previewEl.style.backgroundPosition = 'center';
                previewEl.textContent = '';
            }
            // 先暂存到 userData，提交时持久化
            this.userData.avatarUrl = dataUrl;
        };
        reader.readAsDataURL(file);
    }

    // 保存个人信息
    handleProfileSave() {
        const nameInput = document.getElementById('profileName');
        const name = (nameInput && nameInput.value) ? nameInput.value.trim() : '';
        if (!name) {
            alert('请输入姓名');
            return;
        }
        this.userData.name = name;
        this.saveUserData();
        this.updateAvatarUI();
        alert('个人信息已保存');
        this.showPage('dashboardPage');
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.studySaveApp = new StudySaveApp();
});

// 导出供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudySaveApp;
}