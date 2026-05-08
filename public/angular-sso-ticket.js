/**
 * Angular 单点登录 Ticket 处理脚本
 * 
 * 使用方式：
 * 1. 在 Angular 页面的 <head> 中引入此脚本：
 *    <script src="http://localhost:8080/angular-sso-ticket.js"></script>
 * 
 * 2. 或在 Angular 的 index.html 中引入
 * 
 * 功能：
 * - 页面加载时检查 URL 中的 ticket 参数
 * - 调用 Vue 后端验证 ticket
 * - 设置 Angular 登录所需的 Cookie
 */

(function() {
    'use strict';
    
    // Vue 后端地址（根据实际情况修改）
    var VUE_API_BASE = 'http://localhost:8080';
    
    // 解析 URL 参数
    function getUrlParam(name) {
        var params = window.location.search.substring(1).split('&');
        for (var i = 0; i < params.length; i++) {
            var pair = params[i].split('=');
            if (pair[0] === name) {
                return decodeURIComponent(pair[1] || '');
            }
        }
        return null;
    }
    
    // 调用 Vue 后端验证 ticket
    function verifyTicket(ticket, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', VUE_API_BASE + '/system/angular/ticket/verify', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.withCredentials = true;  // 允许携带 Cookie
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        callback(null, response);
                    } catch (e) {
                        // 尝试解析为 Angular 格式
                        callback(null, { code: 0, params: xhr.responseText });
                    }
                } else {
                    callback(new Error('验证失败: ' + xhr.status));
                }
            }
        };
        
        xhr.send('ticket=' + encodeURIComponent(ticket));
    }
    
    // 设置 Cookie（Angular 登录需要）
    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
    
    // 主函数
    function handleTicket() {
        var ticket = getUrlParam('ticket');
        
        if (!ticket) {
            console.log('[SSO] 无 ticket 参数，跳过验证');
            return;
        }
        
        console.log('[SSO] 检测到 ticket:', ticket);
        
        verifyTicket(ticket, function(err, result) {
            if (err) {
                console.error('[SSO] 验证失败:', err);
                return;
            }
            
            // Angular 格式：{"code":0,"params":{"token":"xxx","username":"xxx"}}
            // 或 RuoYi 格式：{"code":200,"data":{"token":"xxx"}}
            var token = null;
            var username = null;
            
            if (result.code === 0 && result.params) {
                // Angular 格式
                token = result.params.token || result.params.jsessionId;
                username = result.params.username;
            } else if (result.code === 200 && result.data) {
                // RuoYi 格式
                token = result.data.token;
                username = result.data.username;
            }
            
            if (token) {
                console.log('[SSO] 验证成功，设置登录凭证');
                
                // 设置 Angular 登录 Cookie（关键！）
                setCookie('JSESSIONID', token, 1);
                setCookie('ANGULAR_TOKEN', token, 1);
                setCookie('sso_username', username || 'sso_user', 1);
                
                // 触发 Angular 登录事件
                window.dispatchEvent(new CustomEvent('sso-login-success', {
                    detail: { token: token, username: username }
                }));
                
                // 清理 URL 中的 ticket 参数（不刷新页面）
                var url = new URL(window.location.href);
                url.searchParams.delete('ticket');
                window.history.replaceState({}, '', url.toString());
                
                console.log('[SSO] 登录凭证已设置，请刷新页面');
            } else {
                console.error('[SSO] 验证结果无效:', result);
            }
        });
    }
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleTicket);
    } else {
        handleTicket();
    }
    
    // 暴露全局方法供手动调用
    window.angularSso = {
        handleTicket: handleTicket,
        verifyTicket: verifyTicket
    };
    
})();
