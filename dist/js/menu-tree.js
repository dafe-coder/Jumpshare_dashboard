const MenuTree = {
    init: function() {
        this.folderTree = $('.folder-menu-tree');
        this.initFolderStates();
        this.bootstrap();
    },

    bootstrap: function() {
        this.folderTree.on('click', '.folder-menu-header', function(e) {
            e.stopPropagation();
            
            const $folderItem = $(this).parent();
            const $content = $folderItem.children('.folder-menu-content');
            const $toggleIcon = $(this).find('.toggle-menu-icon');
            
            if ($content.length && $content.children().length) {
                $content.toggleClass('hidden');
                
                if ($content.hasClass('hidden')) {
                    $toggleIcon.addClass('-rotate-90');
                } else {
                    $toggleIcon.removeClass('-rotate-90');
                }
            }
        });
    },

    addFolderTo: function($parentFolder, name) {
        const parentLevel = parseInt($parentFolder.attr('data-level'));
        const $newFolder = this.createFolder(name, parentLevel + 1);
        $parentFolder.children('.folder-menu-content').append($newFolder);
        
        $parentFolder.find('.toggle-menu-icon').first().show();
        return $newFolder;
    },

    initFolderStates: function() {
        $('.folder-menu-item').each(function() {
            const $content = $(this).children('.folder-menu-content');
            if ($content.length && !$content.children().length) {
                $(this).find('.toggle-menu-icon').first().hide();
            }
        });
    },

    createFolder: function(name, level) {
        return $(`
            <div class="folder-menu-item" data-level="${level}">
                <div class="folder-menu-header">
                    <span class="toggle-menu-icon">
						<img src="../assets/images/check-down.svg" alt="check">
					</span>
                    <span class="folder-menu-icon">
						<img src="../assets/images/folder.svg" alt="folder">
					</span>
                    <span class="folder-menu-name">${name}</span>
                </div>
                <div class="folder-menu-content hidden"></div>
            </div>
        `);
    }
}

$(document).ready(function() {
    MenuTree.init();
});