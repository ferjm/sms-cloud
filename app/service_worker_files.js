'use strict'
var kCacheFiles = [
'bower_components/fxa-relier-client/fxa-relier-client.js',
'installer.html',
'js/accounts.js',
'js/activity_handler.js',
'js/activity_picker.js',
'js/api-wrapper/dbmanager.js',
'js/api-wrapper/eventmanager.js',
'js/api-wrapper/multimobilemessage.js',
'js/api-wrapper/pouchdb.js',
'js/api-wrapper/providermanager.js',
'js/app.js',
'js/attachment.js',
'js/attachment_menu.js',
'js/attachment_renderer.js',
'js/compose.js',
'js/contact_renderer.js',
'js/contacts.js',
'js/desktop-only/assets/kitten.bmp',
'js/desktop-only/assets/kitten.jpg',
'js/desktop-only/assets/photo-man-bowtie.jpg',
'js/desktop-only/assets/photo-man.jpg',
'js/desktop-only/assets/photo-woman.jpg',
'js/desktop-only/async_storage.js',
'js/desktop-only/navigator_moz_contacts.js',
'js/desktop-only/navigator_moz_icc_manager.js',
'js/desktop-only/navigator_moz_mobilemessage.js',
'js/desktop-only/navigator_moz_settings.js',
'js/dialog.js',
'js/drafts.js',
'js/error_dialog.js',
'js/errors.js',
'js/event_dispatcher.js',
'js/iac/event_dispatcher.js',
'js/iac/shared_worker.js',
'js/information.js',
'js/installer.js',
'js/link_action_handler.js',
'js/link_helper.js',
'js/localization_helper.js',
'js/message_manager.js',
'js/messages_list.js',
'js/mock_content.js',
'js/mock_updates.js',
'js/navigation.js',
'js/notify.js',
'js/protocols/bridge.js',
'js/protocols/ipdl/PService.ipdl',
'js/protocols/ipdl/PSession.ipdl',
'js/protocols/ipdl/PUpdate.ipdl',
'js/protocols/ipdl.js',
'js/protocols/ipdl_parser.js',
'js/protocols/message.js',
'js/protocols/protocol.js',
'js/protocols/protocol_helper.js',
'js/protocols/store.js',
'js/protocols/utils/uuid.js',
'js/recipients.js',
'js/selection_handler.js',
'js/sessionstore/api.js',
'js/sessionstore/worker_api.js',
'js/settings.js',
'js/shared_components.js',
'js/silent_sms.js',
'js/smil.js',
'js/startup.js',
'js/string-polyfill.js',
'js/subject_composer.js',
'js/sw-bootstrap.js',
'js/sw-utils.js',
'js/task_runner.js',
'js/thread_content.js',
'js/thread_list_ui.js',
'js/thread_startup.js',
'js/thread_ui.js',
'js/threads.js',
'js/time_headers.js',
'js/utils.js',
'js/waiting_screen.js',
'js/wbmp.js',
'list.html',
'locales/sms.ar.properties',
'locales/sms.en-US.properties',
'locales/sms.fr.properties',
'locales/sms.zh-TW.properties',
'locales-obj/ar.json',
'locales-obj/en-US.json',
'locales-obj/fr.json',
'locales-obj/zh-TW.json',
'manifest.webapp',
'service_worker.js',
'service_worker_files.js',
'shared/elements/config.js',
'shared/elements/gaia-header/dist/gaia-header.js',
'shared/elements/gaia-icons/fonts/gaia-icons.ttf',
'shared/elements/gaia-icons/gaia-icons.css',
'shared/elements/gaia-theme/gaia-theme.css',
'shared/elements/gaia-theme/lib/gaia-theme-selector.js',
'shared/elements/gaia_menu/images/icons/back.png',
'shared/elements/gaia_menu/images/icons/close.png',
'shared/elements/gaia_menu/script.js',
'shared/elements/gaia_menu/style.css',
'shared/elements/gaia_sim_picker/images/long-tap-indicator.png',
'shared/elements/gaia_sim_picker/script.js',
'shared/elements/gaia_sim_picker/style.css',
'shared/js/async_storage.js',
'shared/js/component_utils.js',
'shared/js/contact_photo_helper.js',
'shared/js/date_time_helper.js',
'shared/js/fb/fb_data_reader.js',
'shared/js/fb/fb_reader_utils.js',
'shared/js/fb/fb_request.js',
'shared/js/gesture_detector.js',
'shared/js/image_utils.js',
'shared/js/l10n.js',
'shared/js/l10n_date.js',
'shared/js/lazy_loader.js',
'shared/js/mime_mapper.js',
'shared/js/mobile_operator.js',
'shared/js/multi_sim_action_button.js',
'shared/js/notification_helper.js',
'shared/js/option_menu.js',
'shared/js/performance_testing_helper.js',
'shared/js/settings_listener.js',
'shared/js/settings_url.js',
'shared/js/sticky_header.js',
'shared/js/template.js',
'shared/js/usertiming.js',
'shared/style/action_menu/header_actions.html',
'shared/style/action_menu/images/icons/back.png',
'shared/style/action_menu/images/icons/close.png',
'shared/style/action_menu/index.html',
'shared/style/action_menu.css',
'shared/style/buttons/images/next.png',
'shared/style/buttons/index.html',
'shared/style/buttons.css',
'shared/style/confirm/content.html',
'shared/style/confirm/content_details.html',
'shared/style/confirm/images/ui/gradient.png',
'shared/style/confirm/images/ui/pattern.png',
'shared/style/confirm/index.html',
'shared/style/confirm/long_content.html',
'shared/style/confirm/no_title.html',
'shared/style/confirm.css',
'shared/style/edit_mode/index.html',
'shared/style/edit_mode.css',
'shared/style/headers.css',
'shared/style/input_areas/images/clear.png',
'shared/style/input_areas/images/clear_dark.png',
'shared/style/input_areas/images/dialog.svg',
'shared/style/input_areas/images/dialog_active.svg',
'shared/style/input_areas/images/dialog_disabled.svg',
'shared/style/input_areas/images/dialog_disabled_rtl.svg',
'shared/style/input_areas/images/dialog_rtl.svg',
'shared/style/input_areas/images/search.svg',
'shared/style/input_areas/images/search_dark.svg',
'shared/style/input_areas/index.html',
'shared/style/input_areas.css',
'shared/style/lists/index.html',
'shared/style/lists.css',
'shared/style/option_menu.css',
'shared/style/progress_activity/images/ui/activity.png',
'shared/style/progress_activity/images/ui/default.png',
'shared/style/progress_activity/images/ui/light.png',
'shared/style/progress_activity/index.html',
'shared/style/progress_activity.css',
'shared/style/status/images/ui/pattern.png',
'shared/style/status/index.html',
'shared/style/status.css',
'shared/style/switches/images/check/danger.png',
'shared/style/switches/images/check/default.png',
'shared/style/switches/images/radio/danger.png',
'shared/style/switches/images/radio/default.png',
'shared/style/switches/images/switch/background.png',
'shared/style/switches/images/switch/background_off.png',
'shared/style/switches/images/switch/background_rtl.png',
'shared/style/switches/index.html',
'shared/style/switches.css',
'sounds/firefox_msg_sent.opus',
'style/attachment.css',
'style/attachment_draft.css',
'style/common.css',
'style/composer.css',
'style/icons/corrupted.png',
'style/icons/sms_126.png',
'style/icons/sms_142.png',
'style/icons/sms_189.png',
'style/icons/sms_284.png',
'style/icons/sms_84.png',
'style/images/SMS_200x200_bubble.png',
'style/images/attachments.png',
'style/images/default-no-profile-pic.png',
'style/images/default_contact_image.png',
'style/images/draft.png',
'style/images/icons/actionicon_sms_add_attachment_30x30.png',
'style/images/icons/actionicon_sms_send_30x30.png',
'style/images/icons/deliveredtick.png',
'style/images/icons/exclamation.png',
'style/images/icons/icon_sms_compose_email.png',
'style/images/icons/message_read.png',
'style/images/unread.png',
'style/message.css',
'style/notification.css',
'style/report_view.css',
'style/root.css',
'style/sms.css',
'test/unit/media/audio.oga',
'test/unit/media/contacts.vcf',
'test/unit/media/grid.png',
'test/unit/media/grid.wbmp',
'test/unit/media/video.ogv',
'thread.html',
'thread_content.html'
];
